import React, { useState } from "react";
import { ReviewConfig } from "@/types";

const launchLanguages = [
  { name: "Go", id: "go", docs: [{ label: "Go Official Docs", url: "https://golang.org/doc/" }] },
  { name: "TypeScript", id: "typescript", docs: [{ label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" }] },
  { name: "Python", id: "python", docs: [{ label: "Python Official Docs", url: "https://docs.python.org/3/" }] },
];

const builtInTemplates = [
  { id: "staff", name: "Staff Engineer", description: "Architecture, scalability, org patterns", tone: "Direct, strategic", systemPrompt: "Review for architecture and scalability." },
  { id: "senior", name: "Senior Engineer", description: "Logic, edge cases, performance, security", tone: "Thorough, precise", systemPrompt: "Look for edge cases and security risks." },
  { id: "junior", name: "Junior Friendly", description: "Correctness, readability, learning opportunities", tone: "Educational, encouraging", systemPrompt: "Explain review points with helpful guidance."},
  { id: "security", name: "Security Audit", description: "OWASP Top 10, auth, data exposure", tone: "Clinical, risk-focused", systemPrompt: "Audit for OWASP Top 10 and data risks."},
  { id: "quick", name: "Quick Scan", description: "Obvious bugs, style, clear wins only", tone: "Concise, fast", systemPrompt: "Only flag the most obvious issues." }
];

const builtInCommands = [
  { trigger: "check-patterns", description: "Flag deviations from common design patterns.", prompt: "Review for design pattern adherence." },
  { trigger: "api-contract", description: "Verify backwards compatibility of API changes.", prompt: "Check for breaking changes in API contracts." },
  { trigger: "test-coverage", description: "Identify logic paths with missing tests.", prompt: "Identify gaps in automated tests." },
  { trigger: "performance", description: "Focus on algorithmic complexity and I/O.", prompt: "Spot performance bottlenecks and inefficiencies." },
  { trigger: "accessibility", description: "For frontend PRs, check ARIA and keyboard nav.", prompt: "Check accessibility issues in UI changes." }
];

interface ReviewOutputProps {
  review: { summary?: string; content?: string; analysis?: Record<string, unknown> };
  onStartReview: (config: ReviewConfig) => void;
}

export function ReviewOutput({ review, onStartReview }: ReviewOutputProps) {
  // Docs config
  const [selectedDocs, setSelectedDocs] = useState<Record<string, string[]>>({}); // languageId -> enabled doc URLs
  // Custom doc fields
  const [customDocUrl, setCustomDocUrl] = useState("");
  const [customDocText, setCustomDocText] = useState("");
  const [uploadedDocFile, setUploadedDocFile] = useState<File | null>(null);
  const [uploadedDocText, setUploadedDocText] = useState("");
  const [selectedDocProfile, setSelectedDocProfile] = useState("");

  // Template config
  const [selectedTemplate, setSelectedTemplate] = useState<string>(builtInTemplates[0].id);
  const [customTemplate, setCustomTemplate] = useState("");

  // Commands config
  const [activeCommands, setActiveCommands] = useState<string[]>([]);
  // Add custom command
  const [customCommand, setCustomCommand] = useState({ trigger: "", description: "", prompt: "" });
  const [customCommandsList, setCustomCommandsList] = useState<{ trigger: string; description?: string; prompt: string }[]>([]);
  // Conflict warning
  const [commandWarning, setCommandWarning] = useState("");

  // Main config, will expand for other fields
  type ExtendedReviewConfig = ReviewConfig & {
    docs?: Array<{ language?: string; urls?: string[]; text?: string; fileName?: string; profile?: string }>;
    systemPrompt?: string;
    commands?: Array<{ trigger: string; description?: string; prompt: string }>;
  };
  const [config, setConfig] = useState<Partial<ExtendedReviewConfig>>({});
  // Validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Handle doc toggle
  function handleDocToggle(langId: string, docUrl: string) {
    setSelectedDocs(prev => {
      const docs = prev[langId] || [];
      return {
        ...prev,
        [langId]: docs.includes(docUrl)
          ? docs.filter(u => u !== docUrl)
          : [...docs, docUrl],
      };
    });
  }

  // Handle command toggle
  function handleCommandToggle(trigger: string) {
    setActiveCommands(prev => (
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    ));
    // TODO: conflict detection (stub)
    setCommandWarning("");
  }

  function handleCustomCommandField(field: string, value: string) {
    setCustomCommand(cmd => {
      const updated = { ...cmd, [field]: value };
     // Conflict detection
     const enteredTrigger = updated.trigger.trim().toLowerCase();
     // Check against built-ins
     if (enteredTrigger && builtInCommands.some(c => c.trigger.toLowerCase() === enteredTrigger)) {
       setCommandWarning("Command trigger conflicts with built-in command");
     }
     // Check against other customs
     else if (enteredTrigger && customCommandsList.some(c => c.trigger.toLowerCase() === enteredTrigger)) {
       setCommandWarning("Command trigger already in use for a custom command");
     }
     else {
       setCommandWarning("");
     }
     return updated;
    });
  }

  function handleAddCustomCommand() {
    // Prevent add if conflict
    if (commandWarning) return;
    if (customCommand.trigger && customCommand.prompt) {
      setCustomCommandsList(list => [...list, { ...customCommand }]);
      setCustomCommand({ trigger: "", description: "", prompt: "" });
    }
  }

  // Handle submit
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    // Prepare docs config
    const docSources: Array<{ language?: string; urls?: string[]; text?: string; fileName?: string; profile?: string }> = [];
    for (const lang of launchLanguages) {
      if (selectedDocs[lang.id] && selectedDocs[lang.id].length) {
        docSources.push({ language: lang.id, urls: selectedDocs[lang.id] });
      }
    }
    if (customDocUrl) {
      // Validate URL
      if (!/^https?:\/\/.+/.test(customDocUrl.trim())) {
        errors.customDocUrl = "Custom doc URL must be valid (https://...)";
      }
      docSources.push({ language: "custom", urls: [customDocUrl] });
    }
    if (customDocText) docSources.push({ language: "custom", text: customDocText });
    if (uploadedDocFile) {
      // Validate file type
      if (!uploadedDocFile.name.endsWith('.md') && !uploadedDocFile.name.endsWith('.txt') && !uploadedDocFile.name.endsWith('.pdf')) {
        errors.uploadedDocFile = "Uploaded file must be .md, .txt or .pdf";
      }
      // Validate doc profile if file
      if (!selectedDocProfile) {
        errors.selectedDocProfile = "Please select a doc profile for uploaded file.";
      }
      docSources.push({
        language: "custom",
        fileName: uploadedDocFile.name,
        text: uploadedDocText || undefined,
        profile: selectedDocProfile || undefined,
      });
    }

    // Require at least one doc source
    if (docSources.length === 0) {
      errors.docSources = "Select or add at least one documentation source.";
    }

    // Prepare template/prompt
    const templatePrompt = customTemplate.trim() || builtInTemplates.find(t => t.id === selectedTemplate)?.systemPrompt || "";
    if (!templatePrompt) {
      errors.templatePrompt = "Select a review template or paste a custom template.";
    }

    // Prepare commands
    const allCommands = [
      ...builtInCommands.filter(cmd => activeCommands.includes(cmd.trigger)),
      ...customCommandsList
    ];
    // Require at least one command
    if (allCommands.length === 0) {
      errors.allCommands = "Select at least one review command.";
    }
    // Custom command validation
    customCommandsList.forEach((cmd, idx) => {
      if (!cmd.trigger || !cmd.prompt) {
        errors[`customCommand${idx}`] = "Custom command must have a trigger and prompt.";
      }
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setConfig(c => ({ ...c, docs: docSources, systemPrompt: templatePrompt, commands: allCommands }));
    onStartReview({ ...config, docs: docSources, systemPrompt: templatePrompt, commands: allCommands } as ExtendedReviewConfig);
  }

   // Render detected languages
   const detectedLangs: Array<{ lang: string }> = Array.isArray(review.analysis?.languages) ? review.analysis.languages : launchLanguages.map(l => ({ lang: l.id }));


  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl bg-gray-900 border border-gray-700 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Review Configuration</h2>
      {review.summary && <p className="text-lg text-green-300 mb-4">{review.summary}</p>}
      {review.content && <div className="prose text-gray-100 mb-5">{review.content}</div>}

       {/* Docs panel */}
       <div className="mb-6">
         <h3 className="text-xl text-blue-400 font-semibold mb-2">Documentation Sources</h3>
         {formErrors.docSources && <div className="text-red-400 text-sm mb-2">{formErrors.docSources}</div>}
         {detectedLangs.map((lang: { lang: string }) => {
           const reg = launchLanguages.find(l => l.id === lang.lang);
           if (!reg) return null;
           return (
             <div key={lang.lang} className="mb-3">
              <span className="text-gray-200 font-bold">{reg.name}</span>
              {reg.docs.map(doc => (
                <label key={doc.url} className="ml-4 text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedDocs[reg.id]?.includes(doc.url) || false}
                    onChange={() => handleDocToggle(reg.id, doc.url)}
                    className="mr-2"
                  />
                  {doc.label}
                </label>
              ))}
            </div>
          );
        })}

        <hr className="my-4 border-gray-700" />

        <div className="space-y-2">
          <h4 className="text-blue-300 font-semibold">Add Custom Documentation</h4>
           <input
             type="url"
             value={customDocUrl}
             onChange={e => setCustomDocUrl(e.target.value)}
             placeholder="Paste a doc URL"
             className="w-full rounded border border-gray-700 p-2 bg-gray-800 text-white"
             aria-label="Paste documentation URL"
             aria-invalid={!!formErrors.customDocUrl}
             aria-describedby={formErrors.customDocUrl ? "error-customDocUrl" : undefined}
           />
           {formErrors.customDocUrl && <div id="error-customDocUrl" role="alert" className="text-red-400 text-sm mt-1">{formErrors.customDocUrl}</div>}
          <textarea
            value={customDocText}
            onChange={e => setCustomDocText(e.target.value)}
            placeholder="Paste raw doc text (e.g. team note or RFC)"
            rows={3}
            className="w-full rounded border border-gray-700 p-2 bg-gray-800 text-white"
          />
          {/* File upload and doc profile logic */}
          <input
            type="file"
            accept=".md,.txt,.pdf"
            className="w-full rounded border border-gray-700 p-2 bg-gray-800 text-white mt-2"
            aria-label="Upload custom documentation file"
            aria-invalid={!!formErrors.uploadedDocFile}
            aria-describedby={formErrors.uploadedDocFile ? "error-uploadedDocFile" : undefined}
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setUploadedDocFile(file);
              if (file) {
                // Only read for text/markdown
                if (file.type.startsWith("text") || file.name.endsWith(".md")) {
                  const reader = new FileReader();
                  reader.onload = evt => {
                    setUploadedDocText(evt.target?.result as string || "");
                  };
                  reader.readAsText(file);
                } else {
                  setUploadedDocText("");
                }
              } else {
                setUploadedDocText("");
              }
            }}
          />
          {formErrors.uploadedDocFile && <div id="error-uploadedDocFile" role="alert" className="text-red-400 text-sm mt-1">{formErrors.uploadedDocFile}</div>}
          {uploadedDocFile && (
            <div className="mt-2 text-gray-300 text-sm">
              Uploaded: {uploadedDocFile.name}
              {uploadedDocText ? <span className="ml-2 text-green-400">(text parsed)</span> : <span className="ml-2 text-yellow-400">(binary/unsupported type)</span>}
            </div>
          )}
          <select
            value={selectedDocProfile}
            onChange={e => setSelectedDocProfile(e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 text-white p-2 mt-2"
            aria-label="Select documentation profile"
            aria-invalid={!!formErrors.selectedDocProfile}
            aria-describedby={formErrors.selectedDocProfile ? "error-selectedDocProfile" : undefined}
          >
            <option value="">Select Doc Profile (optional)</option>
            <option value="team-note">Team Note</option>
            <option value="security-checklist">Security Checklist</option>
            <option value="architecture-rfc">Architecture RFC</option>
            <option value="other">Other</option>
          </select>
          {formErrors.selectedDocProfile && <div id="error-selectedDocProfile" role="alert" className="text-red-400 text-sm mt-1">{formErrors.selectedDocProfile}</div>}
        </div>
      </div>

      {/* Template selector */}
      <div className="mb-6">
        <h3 className="text-xl text-purple-400 font-semibold mb-2">Review Template</h3>
        {formErrors.templatePrompt && <div className="text-red-400 text-sm mb-2">{formErrors.templatePrompt}</div>}
        <div className="space-y-3">
          {builtInTemplates.map(tmpl => (
            <label key={tmpl.id} className="block bg-gray-800 border border-gray-700 rounded-md p-3 cursor-pointer flex items-center">
              <input
                type="radio"
                name="template"
                checked={selectedTemplate === tmpl.id}
                onChange={() => setSelectedTemplate(tmpl.id)}
                className="mr-3"
              />
              <span className="font-bold text-white mr-2">{tmpl.name}</span>
              <span className="text-gray-300 mr-2">{tmpl.description}</span>
              <span className="text-xs text-gray-500">({tmpl.tone})</span>
            </label>
          ))}
        </div>
        <textarea
          value={customTemplate}
          onChange={e => setCustomTemplate(e.target.value)}
          placeholder="Or paste custom template (optional)"
          rows={3}
          className="w-full mt-4 rounded border border-gray-700 p-2 bg-gray-800 text-white"
          aria-label="Paste custom review template"
          aria-invalid={!!formErrors.templatePrompt}
          aria-describedby={formErrors.templatePrompt ? "error-templatePrompt" : undefined}
        />
      </div>

      {/* Commands panel */}
      <div className="mb-6">
        <h3 className="text-xl text-cyan-400 font-semibold mb-2">Custom Commands</h3>
        {formErrors.allCommands && <div className="text-red-400 text-sm mb-2">{formErrors.allCommands}</div>}
        <div className="space-y-2">
          {builtInCommands.map(cmd => (
            <label key={cmd.trigger} className="block bg-gray-800 border border-gray-700 rounded-md p-3 cursor-pointer flex items-center">
              <input
                type="checkbox"
                checked={activeCommands.includes(cmd.trigger)}
                onChange={() => handleCommandToggle(cmd.trigger)}
                className="mr-3"
              />
              <span className="font-bold text-white mr-2">/{cmd.trigger}</span>
              <span className="text-gray-300 mr-2">{cmd.description}</span>
            </label>
          ))}
          {/* Display custom commands added */}
          {customCommandsList.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm text-cyan-400 font-semibold">Custom Commands Added:</h4>
              {customCommandsList.map((cmd, idx) => (
                <div key={cmd.trigger + idx} className="bg-gray-700 p-2 rounded text-gray-200 mt-1">
                  <span className="font-bold">/{cmd.trigger}</span>: {cmd.description}<br />
                  <span className="text-xs text-gray-400">Prompt: {cmd.prompt}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-2">
            <input
              type="text"
              value={customCommand.trigger}
              onChange={e => handleCustomCommandField("trigger", e.target.value)}
              placeholder="Custom command (e.g. check-style)"
              className="w-full rounded border border-gray-700 p-2 bg-gray-800 text-white"
            />
            <input
              type="text"
              value={customCommand.description}
              onChange={e => handleCustomCommandField("description", e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded border border-gray-700 p-2 bg-gray-800 text-white"
            />
            <textarea
              value={customCommand.prompt}
              onChange={e => handleCustomCommandField("prompt", e.target.value)}
              placeholder="Prompt fragment for this command..."
              rows={2}
              className="w-full rounded border border-gray-700 p-2 bg-gray-800 text-white"
            />
          <button
            type="button"
            className="rounded-md bg-cyan-600 px-4 py-2 text-white mt-1 hover:bg-cyan-700"
            onClick={handleAddCustomCommand}
            disabled={!customCommand.trigger || !customCommand.prompt || !!commandWarning}
          >
            Add Custom Command
          </button>
          </div>
        </div>
        {commandWarning && <div className="text-red-400 text-sm mt-2">{commandWarning}</div>}
      </div>

      <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700" disabled={!!commandWarning}>
        Start AI Review
      </button>
    </form>
  );
}
