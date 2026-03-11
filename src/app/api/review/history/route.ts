import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getHistory, countHistory } from "@/app/api/review/data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
  const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
  
  const history = await getHistory(userId, limit, offset);
  const total = await countHistory(userId);
  
  return NextResponse.json({ history, total, user: session?.user || null });
}
