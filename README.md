# PR Review Studio

An extensible, AI-powered GitHub pull request code review platform. Paste any GitHub PR URL and get a deep, structured code review powered by the AI provider of your choice — free to use and free to deploy on Vercel.

## Features

- Paste any GitHub PR URL (public or private with a token)
- Auto-detects languages and frameworks from file extensions and manifest files
- Built-in documentation registry for 18+ languages and frameworks
- Five pre-built review templates: Staff Engineer, Senior Engineer, Junior-Friendly, Security Audit, Performance Review
- Custom review templates — create, save, and reuse your own
- Slash command system: /strict, /explain, /quick, /tests, /docs-check, /naming, /breaking-changes, and custom commands
- Custom documentation — upload files, paste text, or add URLs
- Multi-provider LLM support — bring your own API key for Groq (free), Gemini, Claude, OpenAI, or run locally with Ollama
- Streaming review output rendered as markdown in real time
- Review history persisted to Vercel KV
- Post review as a comment directly to the GitHub PR
- All API keys stored in your browser only — never on the server

## Architecture

Clean Hexagonal Architecture. The core domain has zero framework dependencies. All external I/O (GitHub, LLM providers, storage) goes through typed port interfaces. Adding a new LLM provider requires implementing one interface and registering one entry.

```
src/
  core/          # Pure business logic — no framework deps
    domain/      # Entities, value objects, ports
    use-cases/   # Orchestration
    services/    # Language detection, prompt building, context budgeting
  infrastructure/
    llm/         # Provider implementations (Groq, Gemini, Anthropic, OpenAI, Ollama)
    github/      # GitHub REST API client
    storage/     # Vercel KV repositories
  app/           # Next.js App Router (pages + API routes)
  components/    # React components
  lib/           # Doc registry, templates, commands, utilities
  types/         # Shared TypeScript types
```

## Quick Start

```bash
git clone https://github.com/cxx5208/pr-review-studio
cd pr-review-studio
npm install
cp .env.example .env.local
# Edit .env.local and add your keys
npm run dev
```

Open http://localhost:3000. Go to Settings and add a Groq API key (free at console.groq.com). Paste any public GitHub PR URL and click Analyze.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com and import the repository
3. In Project Settings → Environment Variables, add:
   - `GITHUB_TOKEN` (optional — increases rate limit for public repos)
   - `KV_REST_API_URL` and `KV_REST_API_TOKEN` (from Vercel KV storage)
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Blob storage)
4. Deploy

For KV and Blob: in the Vercel dashboard go to Storage → Create Database → KV, then Storage → Create → Blob. Vercel will automatically link the environment variables.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | No | GitHub PAT with `public_repo` scope. Raises rate limit from 60 to 5000 req/hr |
| `KV_REST_API_URL` | Recommended | Vercel KV URL for review history and templates |
| `KV_REST_API_TOKEN` | Recommended | Vercel KV token |
| `BLOB_READ_WRITE_TOKEN` | Recommended | Vercel Blob token for custom doc uploads |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL. Defaults to http://localhost:3000 |

User API keys (Groq, Gemini, Anthropic, OpenAI) are stored in browser localStorage only and passed via request headers. They are never stored on the server.

## Adding a New LLM Provider

1. Create `src/infrastructure/llm/providers/MyProvider.ts`
2. Implement the `ILLMProvider` interface from `src/core/domain/ports/ILLMProvider.ts`
3. Add the provider to `PROVIDER_REGISTRY` in `src/infrastructure/llm/LLMProviderFactory.ts`
4. Add model definitions to `PROVIDER_MODELS` in `src/lib/constants.ts`
5. Add provider metadata to `PROVIDER_META` in `src/lib/constants.ts`

That is all. The UI, settings page, and review flow automatically pick up new providers.

## Adding a New Documentation Source

1. Create `src/lib/doc-registry/mylanguage.ts`
2. Export an array of `DocEntry` objects (see existing files for the shape)
3. Import and add the entries to the `DOC_REGISTRY` array in `src/lib/doc-registry/index.ts

## License

MIT