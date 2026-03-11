
// src/app/(app)/docs/page.tsx
"use client";

import { useState, useEffect } from "react";

interface CustomDoc {
  id: string;
  label: string;
  type: "url" | "paste" | "upload";
  content: string; // URL, pasted text, or Blob key
}

export default function DocsPage() {
  const [customDocs, setCustomDocs] = useState<CustomDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDocLabel, setNewDocLabel] = useState("");
  const [newDocType, setNewDocType] = useState<"url" | "paste" | "upload">("paste");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCustomDocs = async () => {
      try {
        const response = await fetch("/api/customdocs");
        if (!response.ok) {
          throw new Error("Failed to fetch custom documents");
        }
        const data = await response.json();
        setCustomDocs(data || []);
} catch (err: unknown) {
      setError((err as Error)?.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
    };
    fetchCustomDocs();
  }, []);

  const handleCreateDoc = async () => {
    if (!newDocLabel || (!newDocContent && !newDocFile)) {
      alert("Label and content/file are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload: { label: string; content?: string } = { label: newDocLabel };
      let endpoint = "";

      if (newDocType === "url") {
        endpoint = "/api/customdocs/url";
        payload.content = newDocContent;
      } else if (newDocType === "paste") {
        endpoint = "/api/customdocs/paste";
        payload.content = newDocContent;
      } else if (newDocType === "upload" && newDocFile) {
        endpoint = "/api/customdocs/upload";
        const formData = new FormData();
        formData.append("label", newDocLabel);
        formData.append("file", newDocFile);

        const uploadResponse = await fetch(endpoint, {
          method: "POST",
          body: formData, // No Content-Type header when using FormData, browser sets it
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Failed to upload document");
        }
        const uploadedDoc = await uploadResponse.json();
        setCustomDocs([...customDocs, uploadedDoc]);
        setNewDocLabel("");
        setNewDocType("paste");
        setNewDocContent("");
        setNewDocFile(null);
        return; // Exit early as upload is handled differently
      } else {
        throw new Error("Invalid document type or missing content/file.");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create document");
      }
      const newDoc = await response.json();
      setCustomDocs([...customDocs, newDoc]);
      setNewDocLabel("");
      setNewDocType("paste");
      setNewDocContent("");
      setNewDocFile(null);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom document?")) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/customdocs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete document");
      }
setCustomDocs(customDocs.filter((doc) => doc.id !== id));
      } catch (err: unknown) {
        setError((err as Error)?.message ?? 'Unknown error');
      } finally {
        setIsLoading(false);
      }
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading custom documents...</div>;
  }

  if (error) {
    return <div className="rounded-md bg-red-900 p-4 text-red-300">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-white">Custom Documentation</h1>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-white">Add New Custom Document</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="docLabel" className="mb-1 block text-gray-300">Document Label</label>
            <input
              type="text"
              id="docLabel"
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newDocLabel}
              onChange={(e) => setNewDocLabel(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="docType" className="mb-1 block text-gray-300">Content Type</label>
            <select
              id="docType"
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value as "url" | "paste" | "upload")}
            >
              <option value="paste">Paste Text</option>
              <option value="url">URL</option>
              <option value="upload">Upload File (PDF/TXT)</option>
            </select>
          </div>
          {newDocType === "paste" && (
            <div>
              <label htmlFor="docContent" className="mb-1 block text-gray-300">Pasted Text Content</label>
              <textarea
                id="docContent"
                rows={8}
                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
              ></textarea>
            </div>
          )}
          {newDocType === "url" && (
            <div>
              <label htmlFor="docUrl" className="mb-1 block text-gray-300">Document URL</label>
              <input
                type="url"
                id="docUrl"
                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
              />
            </div>
          )}
          {newDocType === "upload" && (
            <div>
              <label htmlFor="docFile" className="mb-1 block text-gray-300">Upload File (PDF or TXT, max 10MB)</label>
              <input
                type="file"
                id="docFile"
                accept=".pdf,.txt"
                className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white file:mr-4 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-white hover:file:bg-blue-600"
                onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
          )}
          <button
            onClick={handleCreateDoc}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Adding Document..." : "Add Document"}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-white">Existing Custom Documents</h2>
        {customDocs.length === 0 ? (
          <p className="text-gray-400">No custom documents found.</p>
        ) : (
          <ul className="space-y-4">
            {customDocs.map((doc) => (
              <li key={doc.id} className="rounded-md bg-gray-700 p-4">
                <h3 className="text-xl font-semibold text-white">{doc.label} ({doc.type})</h3>
                <p className="text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">{doc.content}</p>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="mt-3 rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
