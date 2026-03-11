// ─── LLM Provider Abstraction ────────────────────────────────────────────────

export type LLMProviderId = 'openai' | 'anthropic' | 'gemini' | 'groq' | 'ollama' | string

export interface LLMProviderConfig {
  id: LLMProviderId
  label: string
  defaultModel: string
  models: string[]
  requiresApiKey: boolean
  baseUrl?: string
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequestOptions {
  model: string
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/** Provider adapter interface – implement to add a new LLM provider */
export interface LLMProviderAdapter {
  config: LLMProviderConfig
  complete(options: LLMRequestOptions, apiKey: string): Promise<LLMResponse>
  stream?(options: LLMRequestOptions, apiKey: string): AsyncIterable<string>
}

// ─── GitHub / PR Types ───────────────────────────────────────────────────────

export interface PRFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'unchanged'
  additions: number
  deletions: number
  patch?: string
  blob_url: string
  raw_url: string
}

export interface PRDetails {
  number: number
  title: string
  body: string | null
  head: { ref: string; sha: string }
  base: { ref: string; sha: string }
  user: { login: string; avatar_url: string }
  created_at: string
  updated_at: string
  html_url: string
  state: 'open' | 'closed' | 'merged'
  draft: boolean
  additions: number
  deletions: number
  changed_files: number
  repo: string;
}

export interface ParsedPRUrl {
  owner: string
  repo: string
  pull: number
}

// ─── Review Types ────────────────────────────────────────────────────────────

export type ReviewSeverity = 'critical' | 'warning' | 'suggestion' | 'info' | 'praise'
export type ReviewCategory =
  | 'security'
  | 'performance'
  | 'correctness'
  | 'maintainability'
  | 'style'
  | 'testing'
  | 'documentation'
  | 'accessibility'
  | 'general'

export interface ReviewComment {
  id: string
  filename: string
  line?: number
  endLine?: number
  severity: ReviewSeverity
  category: ReviewCategory
  title: string
  body: string
  suggestion?: string
  diffPosition?: number
}

export interface ReviewSummary {
  overallScore: number
  headline: string
  praise: string
  concerns: string
  recommendation: 'approve' | 'request-changes' | 'comment'
}

export interface ReviewResult {
  id: string
  prUrl: string
  pr: PRDetails
  files: PRFile[]
  comments: ReviewComment[]
  summary: ReviewSummary
  providerId: LLMProviderId
  model: string
  createdAt: string
  durationMs: number
}

// ─── Review Configuration ─────────────────────────────────────────────────────

export interface ReviewConfig {
  providerId: LLMProviderId
  model: string
  apiKey: string
  githubToken?: string
  focusAreas: ReviewCategory[]
  strictness: 'lenient' | 'balanced' | 'strict'
  maxFilesPerReview: number
  maxLinesPerFile: number
  language?: string
  customInstructions?: string
}

// ─── Doc Registry Types ───────────────────────────────────────────────────────

export interface DocEntry {
  id: string
  language: string
  label: string
  description: string
  officialUrl: string
  keywords: string[]
  contextSnippets: string[]
  triggerPatterns: {
    extensions: string[]
    filenames: string[]
    contentPatterns: string[]
  }
}

// ─── App State ────────────────────────────────────────────────────────────────

export type ReviewStatus = 'idle' | 'fetching' | 'reviewing' | 'complete' | 'error'

export interface ReviewState {
  status: ReviewStatus
  prUrl: string
  config: Partial<ReviewConfig>
  result: ReviewResult | null
  error: string | null
}