import type { PRDetails, PRFile } from '@/types';
import { wrapInDelimiters, createSystemPrompt, sanitizeForPrompt } from './prompt-injection-guard';
import { addVerificationWarnings } from './line-verifier';
import { getDocEntriesForLanguage, languageRegistry } from './lang-registry';

export interface PromptBuilderOptions {
  pr: PRDetails;
  files: PRFile[];
  template: {
    name: string;
    systemPrompt: string;
    badge?: string;
    color?: string;
  };
  selectedLanguages: string[];
  customDocs: Array<{
    label: string;
    content: string;
  }>;
  commands: string[];
}

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
  estimatedTokens: number;
}

const TEMPLATE_VARIABLES: Record<string, (opts: PromptBuilderOptions) => string> = {
  '{{pr_title}}': (opts) => opts.pr.title,
  '{{pr_description}}': (opts) => opts.pr.body || 'No description',
  '{{author}}': (opts) => opts.pr.user.login,
  '{{file_count}}': (opts) => opts.files.length.toString(),
  '{{languages}}': (opts) => opts.selectedLanguages.join(', '),
  '{{repo}}': (opts) => opts.pr.repo,
};

export function interpolateTemplateVariables(template: string, opts: PromptBuilderOptions): string {
  let result = template;
  
  for (const [variable, resolver] of Object.entries(TEMPLATE_VARIABLES)) {
    const value = resolver(opts);
    result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  return result;
}

export function buildPrompt(opts: PromptBuilderOptions): BuiltPrompt {
  const { pr, files, template, selectedLanguages, customDocs, commands } = opts;
  
  const interpolatedTemplate = interpolateTemplateVariables(template.systemPrompt, opts);
  
  const systemPrompt = createSystemPrompt(interpolatedTemplate, {
    includeInjectionWarning: true,
    includeFormatInstructions: true,
  });
  
  const prMetadata = formatPRMetadata(pr);
  
  const diffContent = formatDiffContent(files);
  const sanitizedDiff = sanitizeForPrompt(diffContent);
  const wrappedDiff = wrapInDelimiters(sanitizedDiff, 'diff');
  
  const docsContent = selectedLanguages
    .map(langId => {
      const entries = getDocEntriesForLanguage(langId);
      const langConfig = languageRegistry[langId];
      const docText = entries
        .map(entry => `## ${entry.label}\n${entry.contextSnippets.slice(0, 3).join('\n')}`)
        .join('\n\n');
      return `# ${langConfig?.name || langId} Documentation\n\n${docText}`;
    })
    .join('\n\n\n');
  
  const wrappedDocs = wrapInDelimiters(docsContent, 'docs');
  
  const customDocsContent = customDocs
    .map(doc => `## ${doc.label}\n\n${doc.content}`)
    .join('\n\n');
  const wrappedCustomDocs = wrapInDelimiters(customDocsContent, 'custom');
  
  const commandsContent = commands.length > 0
    ? `\n\n## Active Review Commands\n${commands.map(c => `- ${c}`).join('\n')}`
    : '';
  
  const userPrompt = `<pr_metadata>
${prMetadata}
</pr_metadata>

${wrappedDiff}

${wrappedDocs}

${wrappedCustomDocs}
${commandsContent}

Please provide a thorough code review based on the above context.`;

  return {
    systemPrompt,
    userPrompt,
    estimatedTokens: Math.ceil((systemPrompt.length + userPrompt.length) / 4),
  };
}

function formatPRMetadata(pr: PRDetails): string {
  return `
PR #${pr.number}: ${pr.title}
Repository: ${pr.repo}
Author: ${pr.user.login}
State: ${pr.state}
Files changed: ${pr.changed_files}
Lines added: ${pr.additions}
Lines deleted: ${pr.deletions}
Description:
${pr.body || 'No description provided'}
`.trim();
}

function formatDiffContent(files: PRFile[]): string {
  return files.map(file => {
    const statusMap: Record<string, string> = {
      added: '+',
      removed: '-',
      modified: 'M',
      renamed: 'R',
      copied: 'C',
      unchanged: '=',
    };
    const status = statusMap[file.status] || '?';
    
    const content = file.patch || `${file.filename} (${file.status})`;
    return `${status} ${file.filename}\n\`\`\`diff\n${content}\n\`\`\``;
  }).join('\n\n');
}

export function applyReviewPostProcessing(review: string, files: PRFile[]): string {
  let processed = review;
  
  processed = removePromptInjectionAttempts(processed);
  
  processed = addVerificationWarnings(processed, files);
  
  return processed;
}

function removePromptInjectionAttempts(text: string): string {
  let cleaned = text;
  const patterns = [
    /(?:ignore|disregard|forget|skip) (?:all|everything|previous|prior)/gi,
    /here are the new instructions:[\s\S]*$/gi,
  ];
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned;
}
