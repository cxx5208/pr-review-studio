// ---- Custom server entry for Next.js + WebSockets ----

const { createServer } = require('http');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

let httpServer;
let wss;

app.prepare().then(() => {
  httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // WebSocket server at /ws/review
  wss = new WebSocket.Server({ server: httpServer, path: '/ws/review' });

  wss.on('connection', async function connection(ws, req) {
    // Authenticate connection (future: use cookie/jwt/header)
    // Receive review job config from client
    ws.on('message', async function incoming(message) {
      let payload;
      try {
        payload = JSON.parse(message);
      } catch (e) {
        ws.send(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      // Here, call your review orchestration logic
      // For demo: yield dummy chunks
      ws.send(JSON.stringify({ type: 'progress', content: 'Review started' }));
      // Use OpenAI streaming logic
      try {
        // Dynamically import OpenAI adapter (since server.js is CJS and llm-client.ts is ESM)
        const { openAIAdapter } = require('./src/lib/llm-client');
        const options = payload.options || {};
        const apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
        const stream = openAIAdapter.stream(options, apiKey);
        for await (const chunk of stream) {
          ws.send(JSON.stringify({ type: 'chunk', content: chunk }));
        }
        ws.send(JSON.stringify({ type: 'done', content: 'Review complete' }));
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', content: err.message || 'Streaming failed' }));
      }
      ws.close();
    });
  });

  if (require.main === module) {
    httpServer.listen(PORT, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  }
});

// Export for tests (attach after preparation)
module.exports = {
  get server() { return httpServer; },
  get wss() { return wss; }
};
