
// src/app/(app)/commands/page.tsx
"use client";

import { useState, useEffect } from "react";

interface Command {
  id: string;
  trigger: string;
  description: string;
  promptFragment: string;
  isBuiltIn?: boolean;
}

export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCommandTrigger, setNewCommandTrigger] = useState("");
  const [newCommandDescription, setNewCommandDescription] = useState("");
  const [newCommandFragment, setNewCommandFragment] = useState("");

  useEffect(() => {
    const fetchCommands = async () => {
      try {
const response = await fetch("/api/commands");
        if (!response.ok) {
          throw new Error("Failed to fetch commands");
        }
        const data = await response.json();
        setCommands(data || []);
} catch (err: unknown) {
    setError((err as Error)?.message ?? 'Unknown error');
}
    };
    fetchCommands();
  }, []);

  const handleCreateCommand = async () => {
    if (!newCommandTrigger || !newCommandFragment) {
      alert("Trigger and Prompt Fragment are required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: newCommandTrigger,
          description: newCommandDescription,
          promptFragment: newCommandFragment,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create command");
      }
const newCommand = await response.json();
        setCommands([...commands, newCommand]);
        setNewCommandTrigger("");
        setNewCommandDescription("");
        setNewCommandFragment("");
      } catch (err: unknown) {
        setError((err as Error)?.message ?? 'Unknown error');
      } finally {
        setIsLoading(false);
      }
  };

  const handleDeleteCommand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this command?")) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/commands/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete command");
      }
setCommands(commands.filter((c) => c.id !== id));
      } catch (err: unknown) {
        setError((err as Error)?.message ?? 'Unknown error');
      } finally {
        setIsLoading(false);
      }
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading commands...</div>;
  }

  if (error) {
    return <div className="rounded-md bg-red-900 p-4 text-red-300">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-white">Custom Commands</h1>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-white">Create New Command</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="commandTrigger" className="mb-1 block text-gray-300">Trigger Name (e.g., check-patterns)</label>
            <input
              type="text"
              id="commandTrigger"
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newCommandTrigger}
              onChange={(e) => setNewCommandTrigger(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="commandDescription" className="mb-1 block text-gray-300">Description</label>
            <input
              type="text"
              id="commandDescription"
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newCommandDescription}
              onChange={(e) => setNewCommandDescription(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="promptFragment" className="mb-1 block text-gray-300">Prompt Fragment</label>
            <textarea
              id="promptFragment"
              rows={5}
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={newCommandFragment}
              onChange={(e) => setNewCommandFragment(e.target.value)}
            ></textarea>
          </div>
          <button
            onClick={handleCreateCommand}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Command"}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-white">Existing Commands</h2>
        {commands.length === 0 ? (
          <p className="text-gray-400">No commands found.</p>
        ) : (
          <ul className="space-y-4">
            {commands.map((command) => (
              <li key={command.id} className="rounded-md bg-gray-700 p-4">
                <h3 className="text-xl font-semibold text-white">{command.trigger} {command.isBuiltIn && "(Built-in)"}</h3>
                <p className="text-gray-400">{command.description}</p>
                <p className="mt-2 text-sm text-gray-500">{command.promptFragment.substring(0, 100)}...</p>
                {!command.isBuiltIn && (
                  <button
                    onClick={() => handleDeleteCommand(command.id)}
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
