import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface ReviewHistoryEntry {
  id: string;
  userId?: string | null;
  prUrl: string;
  prTitle?: string | null;
  status: string;
  result?: string | null;
  error?: string | null;
  createdAt: Date;
}

export async function addReview(entry: Omit<ReviewHistoryEntry, "createdAt">) {
  return await prisma.reviewHistoryEntry.create({ data: entry });
}

export async function updateReview(id: string, data: Partial<ReviewHistoryEntry>) {
  return await prisma.reviewHistoryEntry.update({
    where: { id },
    data,
  });
}

export async function getHistory(userId?: string, limit = 10, offset = 0) {
  return await prisma.reviewHistoryEntry.findMany({
    where: userId ? { userId } : undefined,
    skip: offset,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, image: true } } },
  });
}

export async function countHistory(userId?: string) {
  return await prisma.reviewHistoryEntry.count({
    where: userId ? { userId } : undefined,
  });
}

export async function getReviewById(id: string) {
  return await prisma.reviewHistoryEntry.findUnique({
    where: { id },
  });
}

export { prisma };
