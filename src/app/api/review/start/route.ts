import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { addReview } from "@/app/api/review/data";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const body = await request.json();

  if (
    !body ||
    typeof body.prUrl !== "string" ||
    !body.prUrl.trim() ||
    !Array.isArray(body.commands) || body.commands.length === 0 ||
    !Array.isArray(body.docs) || body.docs.length === 0 ||
    ("systemPrompt" in body && typeof body.systemPrompt !== "string")
  ) {
    return NextResponse.json({ message: "Invalid or missing fields: prUrl, commands, docs, template" }, { status: 400 });
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const estimatedSeconds = 10 + Math.floor(Math.random() * 20);

  await addReview({
    id: jobId,
    userId,
    prUrl: body.prUrl,
    prTitle: body.prTitle || null,
    status: "pending",
    result: null,
    error: null,
  });

  return NextResponse.json({ jobId, estimatedSeconds }, { status: 200 });
}
