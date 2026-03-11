import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { kv, userKeys } from '@/lib/kv';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import * as cheerio from 'cheerio';

export interface CustomDoc {
  id: string;
  label: string;
  type: 'url' | 'paste' | 'upload';
  content: string;
  processedChunks?: string[];
  createdAt: string;
}

export interface DocProfile {
  id: string;
  name: string;
  docIds: string[];
  createdAt: string;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

const createDocSchema = z.object({
  label: z.string().min(1).max(100),
  content: z.string().min(1).max(500000).optional(),
  url: z.string().url().optional(),
  type: z.enum(['url', 'paste', 'upload']),
});

function chunkText(text: string): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
    if (chunk.trim()) chunks.push(chunk);
  }
  
  return chunks;
}

async function fetchAndExtractContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReviewKit/1.0 (code-review-tool)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('script, style, nav, header, footer, aside').remove();
    
    const title = $('title').text();
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each(function() {
      headings.push($(this).text());
    });
    const paragraphs: string[] = [];
    $('p').each(function() {
      paragraphs.push($(this).text());
    });
    
    const content = [
      title,
      headings.join('\n'),
      paragraphs.join('\n'),
    ].filter(Boolean).join('\n\n');
    
    return content.slice(0, 500000);
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw error;
  }
}

async function getUserDocs(userId: string): Promise<CustomDoc[]> {
  const ids = await kv.lrange<string>(userKeys.customDocs(userId), 0, -1);
  if (!ids || ids.length === 0) return [];
  
  const docs: CustomDoc[] = [];
  for (const id of ids) {
    const doc = await kv.get<CustomDoc>(`customdoc:${userId}:${id}`);
    if (doc) docs.push(doc);
  }
  return docs;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { pathname, searchParams } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const docId = segments[segments.length - 1];

    if (docId && docId !== 'customdocs') {
      if (session?.user?.id) {
        const userDoc = await kv.get<CustomDoc>(`customdoc:${session.user.id}:${docId}`);
        if (userDoc !== null) {
          return NextResponse.json(userDoc);
        }
      }
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = searchParams.get('type');
    if (type) {
      const userDocs = await getUserDocs(session.user.id);
      return NextResponse.json(userDocs.filter(d => d.type === type));
    }

    return NextResponse.json(await getUserDocs(session.user.id));
  } catch (error) {
    console.error('GET customdocs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const label = formData.get('label') as string;
      const file = formData.get('file') as File | null;

      if (!label || !file) {
        return NextResponse.json({ error: 'Label and file are required' }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      let textContent: string;

      if (file.type === 'application/pdf') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const pdfParse = require('pdf-parse');
          const data = await pdfParse(buffer);
          textContent = data.text;
        } catch {
          textContent = 'PDF content could not be extracted. Please paste the content manually.';
        }
      } else {
        textContent = buffer.toString('utf-8');
      }

      const doc: CustomDoc = {
        id: uuid(),
        label,
        type: 'upload',
        content: textContent,
        processedChunks: chunkText(textContent),
        createdAt: new Date().toISOString(),
      };

      await kv.set(`customdoc:${session.user.id}:${doc.id}`, doc);
      await kv.lpush(userKeys.customDocs(session.user.id), doc.id);

      return NextResponse.json(doc, { status: 201 });
    }

    const body = await request.json();
    const validated = createDocSchema.parse(body);

    let content = validated.content || '';

    if (validated.type === 'url' && validated.url) {
      try {
        content = await fetchAndExtractContent(validated.url);
      } catch {
        return NextResponse.json({ error: 'Failed to fetch URL. Try pasting content directly.' }, { status: 400 });
      }
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const doc: CustomDoc = {
      id: uuid(),
      label: validated.label,
      type: validated.type,
      content,
      processedChunks: chunkText(content),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`customdoc:${session.user.id}:${doc.id}`, doc);
    await kv.lpush(userKeys.customDocs(session.user.id), doc.id);

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('POST customdocs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const docId = segments[segments.length - 1];

    if (!docId || docId === 'customdocs') {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const existing = await kv.get<CustomDoc>(`customdoc:${session.user.id}:${docId}`);
    if (existing === null) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = createDocSchema.partial().parse(body);

    const updated: CustomDoc = {
      ...existing,
      ...validated,
    };

    if (validated.content && validated.content !== existing.content) {
      updated.processedChunks = chunkText(validated.content);
    }

    await kv.set(`customdoc:${session.user.id}:${docId}`, updated);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('PUT customdocs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean);
    const docId = segments[segments.length - 1];

    if (!docId || docId === 'customdocs') {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const existing = await kv.get<CustomDoc>(`customdoc:${session.user.id}:${docId}`);
    if (existing === null) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await kv.del(`customdoc:${session.user.id}:${docId}`);
    await kv.lrem(userKeys.customDocs(session.user.id), 0, docId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE customdocs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
