// src/lib/pr-url.ts

/**
 * Validates a GitHub PR URL
 *
 * Accepts only https://github.com/{owner}/{repo}/pull/{number}
 * Allows trailing slash and fragments; must be https
 * Returns owner, repo, prNumber if valid, null otherwise
 */
export function parseGitHubPrUrl(url: string): null | {
  owner: string;
  repo: string;
  prNumber: number;
} {
  try {
    const m = url.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)(?:[\/\?#].*)?$/
    );
    if (!m) return null;
    const owner = m[1];
    const repo = m[2];
    const prNumber = parseInt(m[3], 10);
    if (!owner || !repo || isNaN(prNumber)) return null;
    return { owner, repo, prNumber };
  } catch {
    return null;
  }
}

/**
 * Returns true if the URL is a valid GitHub PR URL
 */
export function isValidGitHubPrUrl(url: string): boolean {
  return !!parseGitHubPrUrl(url);
}
