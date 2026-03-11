import React, { useState } from "react";
import { isValidGitHubPrUrl } from "@/lib/pr-url";

interface PrInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export function PrInput({ onAnalyze, isLoading }: PrInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = isValidGitHubPrUrl(inputValue);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setTouched(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isValid) {
      onAnalyze(inputValue);
      setTouched(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <label htmlFor="pr-url" className="block text-gray-300 text-lg font-semibold">
        GitHub Pull Request URL
      </label>
      <input
        id="pr-url"
        type="url"
        value={inputValue}
        onChange={handleChange}
        placeholder="https://github.com/owner/repo/pull/123"
        className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        autoComplete="off"
        required
        disabled={isLoading}
      />
      {touched && !isValid && inputValue && (
        <p className="text-red-400 text-sm mt-1">Enter a valid GitHub PR URL (e.g. https://github.com/octocat/Hello-World/pull/42).</p>
      )}
      <button
        type="submit"
        className={`rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 ${(!isValid || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!isValid || isLoading}
      >
        {isLoading ? "Analyzing..." : "Analyze PR"}
      </button>
    </form>
  );
}
