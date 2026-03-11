// src/lib/pr-url.test.ts
import { isValidGitHubPrUrl, parseGitHubPrUrl } from './pr-url';

describe('isValidGitHubPrUrl', () => {
  it('accepts a canonical PR URL', () => {
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World/pull/42')).toBe(true);
    expect(parseGitHubPrUrl('https://github.com/octocat/Hello-World/pull/42')).toEqual({
      owner: 'octocat',
      repo: 'Hello-World',
      prNumber: 42,
    });
  });

  it('accepts PR URL with trailing slash', () => {
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World/pull/42/')).toBe(true);
  });

  it('accepts PR URL with fragment', () => {
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World/pull/42#discussion')).toBe(true);
  });

  it('rejects non-GitHub URLs', () => {
    expect(isValidGitHubPrUrl('https://gitlab.com/octocat/Hello-World/pull/42')).toBe(false);
  });

  it('rejects malformed PR URLs', () => {
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World/issues/42')).toBe(false);
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World/pull/abc')).toBe(false);
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World')).toBe(false);
    expect(isValidGitHubPrUrl('ftp://github.com/octocat/Hello-World/pull/42')).toBe(false);
  });

  it('rejects URLs with missing PR number', () => {
    expect(isValidGitHubPrUrl('https://github.com/octocat/Hello-World/pull/')).toBe(false);
  });
});
