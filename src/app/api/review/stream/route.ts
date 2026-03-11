
// src/app/api/review/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  console.log('Streaming review for job:', jobId);

  // Placeholder for SSE stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('event: chunk\ndata: {"text": "## Executive Summary\n\n"}\n\n'));
      await new Promise(resolve => setTimeout(resolve, 500));
      controller.enqueue(encoder.encode('event: chunk\ndata: {"text": "This PR introduces..."}\n\n'));
      await new Promise(resolve => setTimeout(resolve, 500));
      controller.enqueue(encoder.encode('event: done\ndata: {"reviewId": "rev_xyz", "tokenCount": 4821}\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
