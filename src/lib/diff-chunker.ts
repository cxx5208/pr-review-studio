import { countTokens, truncateTokens, MAX_TOTAL_TOKENS, DEFAULT_BUDGET } from './token-budget';
import type { PRFile } from '@/types';

export interface DiffChunk {
  id: string;
  files: PRFile[];
  content: string;
  tokenCount: number;
  description: string;
}

export function groupFilesByDirectory(files: PRFile[]): Record<string, PRFile[]> {
  const groups: Record<string, PRFile[]> = {};
  
  for (const file of files) {
    const parts = file.filename.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
  }
  
  return groups;
}

export function calculateDiffTokens(files: PRFile[]): number {
  return files.reduce((sum, file) => {
    const content = file.patch || `${file.filename} (${file.status})`;
    return sum + countTokens(content);
  }, 0);
}

export function chunkDiff(files: PRFile[], maxTokens: number = DEFAULT_BUDGET.diff): DiffChunk[] {
  const totalTokens = calculateDiffTokens(files);
  
  if (totalTokens <= maxTokens) {
    return [{
      id: 'main',
      files,
      content: formatDiffContent(files),
      tokenCount: totalTokens,
      description: `All ${files.length} files`,
    }];
  }
  
  const groups = groupFilesByDirectory(files);
  const groupEntries: Array<{ dir: string; files: PRFile[]; tokens: number }> = [];
  
  for (const [dir, dirFiles] of Object.entries(groups)) {
    groupEntries.push({
      dir,
      files: dirFiles,
      tokens: calculateDiffTokens(dirFiles),
    });
  }
  
  groupEntries.sort((a, b) => b.tokens - a.tokens);
  
  const chunks: DiffChunk[] = [];
  let currentChunk: DiffChunk | null = null;
  let currentTokens = 0;
  
  for (const group of groupEntries) {
    if (!currentChunk || currentTokens + group.tokens > maxTokens) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = {
        id: `chunk-${chunks.length + 1}`,
        files: [],
        content: '',
        tokenCount: 0,
        description: '',
      };
      currentTokens = 0;
    }
    
    const content = formatDiffContent(group.files);
    currentChunk.files.push(...group.files);
    currentChunk.content += `\n\n## Directory: ${group.dir}\n\n${content}`;
    currentChunk.tokenCount += group.tokens;
    currentChunk.description = `${currentChunk.files.length} files`;
    currentTokens += group.tokens;
  }
  
  if (currentChunk && currentChunk.files.length > 0) chunks.push(currentChunk);
  
  return chunks;
}

function formatDiffContent(files: PRFile[]): string {
  return files.map(file => {
    const status = file.status === 'added' ? '+' : file.status === 'removed' ? '-' : 'M';
    const content = file.patch || `File ${file.status}`;
    return `### ${status} ${file.filename}\n\`\`\`diff\n${content}\n\`\`\``;
  }).join('\n\n');
}

export function createChunkedReviewPlan(
  files: PRFile[],
  systemPromptTokens: number,
  prMetadataTokens: number,
  docsTokens: number,
  commandsTokens: number,
  responseTokens: number
): {
  chunks: DiffChunk[];
  willFit: boolean;
  estimatedTotalTokens: number;
} {
  const availableForDiff = MAX_TOTAL_TOKENS - systemPromptTokens - prMetadataTokens - docsTokens - commandsTokens - responseTokens;
  const chunks = chunkDiff(files, availableForDiff);
  
  const chunkTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
  const estimatedTotal = systemPromptTokens + prMetadataTokens + chunkTokens + docsTokens + commandsTokens + responseTokens;
  
  return {
    chunks,
    willFit: estimatedTotal <= MAX_TOTAL_TOKENS,
    estimatedTotalTokens: estimatedTotal,
  };
}
