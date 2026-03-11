
// src/app/(app)/templates/page.tsx
"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  isBuiltIn?: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplatePrompt, setNewTemplatePrompt] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        setTemplates(data || []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplateName || !newTemplatePrompt) {
      alert("Name and System Prompt are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplateName,
          systemPrompt: newTemplatePrompt,
          description: `Custom template: ${newTemplateName}`,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create template");
      }
      const newTemplate = await response.json();
      setTemplates([...templates, newTemplate]);
      setNewTemplateName("");
      setNewTemplatePrompt("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete template");
      }
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return <div className="text-center text-gray-400">Loading templates...</div>;
  }

  if (error) {
    return <div className="rounded-md bg-red-900 p-4 text-red-300">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-white">Review Templates</h1>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-white">Create New Template</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="templateName" className="mb-1 block text-gray-300">Template Name</label>
            <input
              type="text"
              id="templateName"
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="systemPrompt" className="mb-1 block text-gray-300">System Prompt</label>
            <textarea
              id="systemPrompt"
              rows={5}
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newTemplatePrompt}
              onChange={(e) => setNewTemplatePrompt(e.target.value)}
            ></textarea>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Template"}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-white">Existing Templates</h2>
        {templates.length === 0 ? (
          <p className="text-gray-400">No templates found.</p>
        ) : (
          <ul className="space-y-4">
            {templates.map((template) => (
              <li key={template.id} className="rounded-md bg-gray-700 p-4">
                <h3 className="text-xl font-semibold text-white">{template.name} {template.isBuiltIn && "(Built-in)"}</h3>
                <p className="text-gray-400">{template.description}</p>
                <p className="mt-2 text-sm text-gray-500">{template.systemPrompt.substring(0, 100)}...</p>
                {!template.isBuiltIn && (
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="mt-3 rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
