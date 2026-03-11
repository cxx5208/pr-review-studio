
// src/app/(app)/page.tsx
"use client";

import { useState } from "react";

import { PrInput } from "@/components/pr-input";
import { ReviewOutput } from "@/components/review-output";
import { ReviewHistory } from "@/components/review-history";
import { ReviewConfig } from "@/types";

export default function HomePage() {
  const [prUrl, setPrUrl] = useState("");
   const [reviewResult, setReviewResult] = useState<{ summary?: string; content?: string; analysis?: Record<string, unknown> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);


  const handleAnalyzePR = async (url: string) => {
    setPrUrl(url);
    setIsLoading(true);
    setError(null);
    setReviewResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze PR");
      }

      const data = await response.json();
      console.log("PR Analysis Data:", data);
      // Here you might update a global state or pass data to other components for configuration
      // For now, let's just show a simple message
      setReviewResult({ summary: `PR "${data.pr.title}" analyzed. Ready for review configuration.` });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

   const handleStartReview = async (config: ReviewConfig) => {
    setIsLoading(true);
    setError(null);
    setReviewResult(null);

    let ws: WebSocket | null = null;
    let fullReviewContent = "";

    try {
      // Extract commands and docs from config (which may be extended type)
      const cfg = config as unknown as { commands?: Array<{ trigger?: string }>; docs?: Array<{ language?: string }>; systemPrompt?: string };
      const commands = cfg.commands?.map((c: { trigger?: string }) => c.trigger || "") || [];
      const docs = cfg.docs?.map((d: { language?: string }) => d.language || "custom") || [];
      const systemPrompt = cfg.systemPrompt;

      // First, create a review job in the database
      const jobResponse = await fetch("/api/review/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prUrl,
          commands,
          docs,
          systemPrompt,
        }),
      });

      if (!jobResponse.ok) {
        const errData = await jobResponse.json();
        throw new Error(errData.message || "Failed to start review job");
      }

      // Now connect to WebSocket for streaming
      ws = new window.WebSocket(
        `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/review`
      );

      ws.onopen = () => {
        // Send the review job payload
        ws?.send(JSON.stringify({ prUrl, ...config }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Progress: optional, could update UI (if needed)
          if (data.type === "progress" && data.progress) {
            // Optionally display progress
            // setReviewResult({ summary: `Progress: ${data.progress}%` });
          }
          // Chunk: update content as it streams
          if (data.type === "chunk" && data.text) {
            fullReviewContent += data.text;
            setReviewResult({ content: fullReviewContent });
          }
          // Done: close socket, set loading false
          if (data.type === "done") {
            ws?.close();
            setIsLoading(false);
            // Optionally set review summary
            setReviewResult(prev => ({ ...prev, summary: data.summary || "Review complete." }));
            // Refresh history after completion
            setRefreshHistory(n => n + 1);
          }
          // Error: show error, close
          if (data.type === "error") {
            setError(data.message || "Review streaming error.");
            ws?.close();
            setIsLoading(false);
          }
        } catch {
          setError("Malformed WebSocket message");
          ws?.close();
          setIsLoading(false);
        }
      };

      ws.onerror = () => {
        setError("WebSocket error. Please retry.");
        ws?.close();
        setIsLoading(false);
      };

      ws.onclose = () => {
        setIsLoading(false);
      };

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }

  };



  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-white">AI Code Review</h1>

      <PrInput onAnalyze={handleAnalyzePR} isLoading={isLoading} />

      {error && (
        <div className="rounded-md bg-red-900 p-4 text-red-300">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {reviewResult && !isLoading && (
        <ReviewOutput review={reviewResult} onStartReview={handleStartReview} />
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-4 text-xl text-gray-400">Processing review...</p>
        </div>
      )}

      <ReviewHistory refreshTrigger={refreshHistory} />
    </div>
  );
}
