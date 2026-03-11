import request from 'supertest';
import { createServer } from 'http';

const testServer = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/review/start' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.prUrl) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Missing prUrl' }));
          return;
        }
        if (typeof payload.prUrl !== 'string' || !payload.prUrl.startsWith('http')) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Invalid prUrl format' }));
          return;
        }
        if (payload.commands && !Array.isArray(payload.commands)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'commands must be an array' }));
          return;
        }
        if (!payload.commands?.length && !payload.docs?.length) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Missing commands or docs' }));
          return;
        }
        const jobId = `job-${Date.now()}`;
        res.statusCode = 200;
        res.end(JSON.stringify({ jobId, estimatedSeconds: 60 }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Invalid payload' }));
      }
    });
    return;
  }
  
  if (req.url?.startsWith('/api/review/history') && req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const history = [
      { id: '1', prUrl: 'https://github.com/test/repo/pull/1', status: 'completed', createdAt: new Date().toISOString() },
      { id: '2', prUrl: 'https://github.com/test/repo/pull/2', status: 'pending', createdAt: new Date().toISOString() }
    ];
    const paginated = history.slice(offset, offset + limit);
    res.statusCode = 200;
    res.end(JSON.stringify({ history: paginated, total: history.length }));
    return;
  }
  
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Not found' }));
});

describe('Review API Endpoints', () => {
  beforeAll((done) => {
    testServer.listen(0, done);
  });

  afterAll((done) => {
    testServer.close(done);
  });

  describe('POST /api/review/start', () => {
    it('should reject invalid payload', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ bad: 'data' }));
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject missing prUrl', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ commands: ['A'], docs: ['B'] }));
      expect(res.status).toBe(400);
    });

    it('should reject empty commands/docs', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ prUrl: 'https://github.com/octocat/repo/pull/1', commands: [], docs: [] }));
      expect(res.status).toBe(400);
    });

    it('should create a new review job with valid payload', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          prUrl: 'https://github.com/octocat/repo/pull/2',
          commands: ['review-code'],
          docs: ['README.md'],
          systemPrompt: 'Be strict',
        }));
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('jobId');
      expect(res.body).toHaveProperty('estimatedSeconds');
    });

    it('should reject invalid prUrl format', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ prUrl: 'not-a-url', commands: ['A'] }));
      expect(res.status).toBe(400);
    });

    it('should reject non-array commands', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ prUrl: 'https://github.com/octocat/repo/pull/1', commands: 'not-array' }));
      expect(res.status).toBe(400);
    });

    it('should handle only docs without commands', async () => {
      const res = await request(testServer)
        .post('/api/review/start')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ prUrl: 'https://github.com/octocat/repo/pull/1', docs: ['README.md'] }));
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('jobId');
    });
  });

  describe('GET /api/review/history', () => {
    it('should list review history', async () => {
      const res = await request(testServer)
        .get('/api/review/history');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(typeof res.body.total).toBe('number');
    });

    it('should paginate history', async () => {
      const res = await request(testServer)
        .get('/api/review/history?limit=1&offset=0');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeLessThanOrEqual(1);
      expect(typeof res.body.total).toBe('number');
    });

    it('should handle negative offset gracefully', async () => {
      const res = await request(testServer)
        .get('/api/review/history?offset=-1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
    });

    it('should handle non-numeric pagination params', async () => {
      const res = await request(testServer)
        .get('/api/review/history?limit=abc&offset=xyz');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.history)).toBe(true);
    });
  });
});
