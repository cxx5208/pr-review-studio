
// src/app/(app)/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ReviewResult } from "@/types"; // Assuming types are defined

export default function HistoryPage() {
  const [reviews, setReviews] = useState<ReviewResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/review/history"); // This API route needs to be created
        if (!response.ok) {
          throw new Error("Failed to fetch review history");
        }
        const data = await response.json();
        setReviews(data.history || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading history...</div>;
  }

  if (error) {
    return <div className="rounded-md bg-red-900 p-4 text-red-300">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-white">Review History</h1>
      {reviews.length === 0 ? (
        <p className="text-gray-400">No reviews yet. Start a new review on the <Link href="/" className="text-blue-400 hover:underline">home page</Link>!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg bg-gray-800 p-4 shadow-md">
              <h2 className="text-xl font-semibold text-blue-300">{review.pr.title}</h2>
              <p className="text-gray-400">Repo: {review.pr.repo}</p>
              <p className="text-gray-400">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
              <Link href={`/history/${review.id}`} className="mt-2 inline-block text-blue-400 hover:underline">
                View Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
