import { DocEntry } from '@/types';

export interface DocFetchResult {
  url: string;
  title: string;
  content: string;
  fetchedAt: Date;
}

const docCache = new Map<string, { data: DocFetchResult; expires: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60;

export async function fetchDoc(url: string): Promise<DocFetchResult> {
  const cached = docCache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ReviewKit/1.0 (GitHub PR Review Tool)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doc: ${response.status}`);
    }

    const html = await response.text();
    const title = extractTitle(html) || url;
    const content = extractContent(html);

    const result: DocFetchResult = {
      url,
      title,
      content,
      fetchedAt: new Date(),
    };

    docCache.set(url, { data: result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractContent(html: string): string {
  const scriptMatch = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const styleMatch = scriptMatch.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  const text = styleMatch.replace(/<[^>]+>/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

export interface ScoredDoc {
  entry: DocEntry;
  score: number;
  matchedKeywords: string[];
}

export function scoreDocsForDiff(
  entries: DocEntry[],
  diffContent: string,
  fileExtensions: string[]
): ScoredDoc[] {
  const diffLower = diffContent.toLowerCase();
  const extSet = new Set(fileExtensions.map(e => e.toLowerCase()));

  const scored = entries.map(entry => {
    let score = 0;
    const matchedKeywords: string[] = [];

    if (matchesTriggerPatterns(entry.triggerPatterns, extSet, diffLower)) {
      score += 50;
    }

    for (const keyword of entry.keywords) {
      const keywordLower = keyword.toLowerCase();
      const regex = new RegExp(`\\b${escapeRegex(keywordLower)}\\b`, 'gi');
      const matches = diffLower.match(regex);
      if (matches) {
        score += matches.length * 10;
        matchedKeywords.push(keyword);
      }
    }

    return { entry, score, matchedKeywords };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

function matchesTriggerPatterns(
  patterns: DocEntry['triggerPatterns'],
  extensions: Set<string>,
  content: string
): boolean {
  for (const ext of patterns.extensions) {
    if (extensions.has(ext.toLowerCase())) {
      return true;
    }
  }

  for (const pattern of patterns.contentPatterns) {
    if (content.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function clearDocCache(): void {
  docCache.clear();
}
