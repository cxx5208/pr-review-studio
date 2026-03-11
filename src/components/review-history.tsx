"use client";

import { useState, useEffect } from "react";

interface ReviewJob {
  id: string;
  prUrl: string;
  status: string;
  createdAt: string;
}

interface ReviewHistoryProps {
  refreshTrigger?: number;
}

export function ReviewHistory({ refreshTrigger }: ReviewHistoryProps) {
  const [history, setHistory] = useState<ReviewJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, refreshTrigger]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/review/history?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.history || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setOffset((page - 1) * limit);
  }

  return (
    <div className="mt-8 p-6 rounded-xl bg-gray-900 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Review History</h2>
      
      {loading && <p className="text-gray-400">Loading history...</p>}
      
      {error && (
        <div role="alert" className="text-red-400 mb-4">
          Error: {error}
          <button onClick={fetchHistory} className="ml-2 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && history.length === 0 && (
        <p className="text-gray-400">No review history yet.</p>
      )}
      
      {!loading && !error && history.length > 0 && (
        <>
          <ul className="space-y-2 mb-4">
            {history.map((job) => (
              <li key={job.id} className="bg-gray-800 p-3 rounded border border-gray-700 flex justify-between items-center">
                <div>
                  <a 
                    href={job.prUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-mono text-sm"
                  >
                    {job.prUrl}
                  </a>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  job.status === 'completed' ? 'bg-green-900 text-green-300' :
                  job.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages} ({total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
