import tiktoken from 'tiktoken';

export function countTokens(text: string): number {
  try {
    const enc = tiktoken.get_encoding('cl100k_base');
    const tokens = enc.encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Token counting error:', error);
    return Math.ceil(text.length / 4);
  }
}

export function truncateTokens(text: string, maxTokens: number): string {
  try {
    const enc = tiktoken.get_encoding('cl100k_base');
    const tokens = enc.encode(text);
    if (tokens.length <= maxTokens) return text;
    
    const truncatedTokens = tokens.slice(0, maxTokens);
    return new TextDecoder().decode(truncatedTokens);
  } catch (error) {
    const roughTokens = Math.ceil(text.length / 4);
    if (roughTokens <= maxTokens) return text;
    return text.slice(0, maxTokens * 4);
  }
}

export interface TokenBudget {
  systemPrompt: number;
  prMetadata: number;
  diff: number;
  docsPerLanguage: number;
  customDocs: number;
  commands: number;
  responseBuffer: number;
}

export const DEFAULT_BUDGET: TokenBudget = {
  systemPrompt: 3000,
  prMetadata: 1000,
  diff: 60000,
  docsPerLanguage: 8000,
  customDocs: 20000,
  commands: 2000,
  responseBuffer: 40000,
};

export const MAX_TOTAL_TOKENS = 150000;

export function calculateTotalBudget(budget: Partial<TokenBudget> = {}): number {
  const merged = { ...DEFAULT_BUDGET, ...budget };
  return (
    merged.systemPrompt +
    merged.prMetadata +
    merged.diff +
    merged.docsPerLanguage +
    merged.customDocs +
    merged.commands +
    merged.responseBuffer
  );
}

export function enforceBudget(
  sections: { name: string; content: string; priority: number }[],
  maxTokens: number
): string[] {
  const sorted = [...sections].sort((a, b) => a.priority - b.priority);
  const results: string[] = [];
  let usedTokens = 0;

  for (const section of sorted) {
    const sectionTokens = countTokens(section.content);
    if (usedTokens + sectionTokens <= maxTokens) {
      results.push(section.content);
      usedTokens += sectionTokens;
    } else if (section.priority < 3) {
      const remaining = maxTokens - usedTokens;
      if (remaining > 100) {
        results.push(truncateTokens(section.content, remaining));
        usedTokens += remaining;
      }
    }
  }

  return results;
}
