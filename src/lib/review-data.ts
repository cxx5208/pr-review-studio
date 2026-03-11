// Simple in-memory review history store
export interface ReviewHistoryEntry {
  id: string;
  prUrl: string;
  createdAt: string;
  result: string;
}

const reviewHistory: ReviewHistoryEntry[] = [];

export function addReview(entry: ReviewHistoryEntry) {
  reviewHistory.push(entry);
}

export function getHistory(limit = 10, offset = 0) {
  return reviewHistory.slice(offset, offset + limit);
}

export function countHistory() {
  return reviewHistory.length;
}
