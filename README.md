# HealthHelp Knowledge Base

Patient-facing knowledge base built with Next.js 16 (App Router), Sanity CMS, Algolia search, and deployed on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2FMarvinAmador7%2Fhealthhelp-kb)

## Deploy to Vercel (5-step setup)

**Step 1 — Import project**

Click the button above, or go to [vercel.com/new/import?s=https://github.com/MarvinAmador7/healthhelp-kb](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2FMarvinAmador7%2Fhealthhelp-kb). Vercel will ask for these env vars during setup:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) → new project → Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_WRITE_TOKEN` | Sanity project → API → Tokens → Add Editor token |
| `SANITY_WEBHOOK_SECRET` | Any random string (e.g. `openssl rand -hex 20`) |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | [algolia.com](https://www.algolia.com/account/api-keys) → API Keys |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | Algolia → Search-Only API Key |
| `ALGOLIA_ADMIN_KEY` | Algolia → Admin API Key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 → Admin → Data Streams → Measurement ID (optional) |

**Step 2 — Deploy**

After setting env vars, Vercel deploys automatically. Note your production URL (e.g. `https://healthhelp-kb.vercel.app`).

**Step 3 — Seed Sanity content**

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_WRITE_TOKEN=xxx bun scripts/seed.ts
```

This creates 8 categories, 5 sample articles, and a system author.

**Step 4 — Index to Algolia**

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx NEXT_PUBLIC_ALGOLIA_APP_ID=xxx ALGOLIA_ADMIN_KEY=xxx bun scripts/algolia-index.ts
```

**Step 5 — Set up Sanity webhooks**

In [sanity.io/manage](https://sanity.io/manage) → your project → API → Webhooks, add two webhooks:

| Name | URL | Filter | Trigger |
|---|---|---|---|
| Revalidate pages | `https://{your-url}/api/revalidate` | `_type == "article" \|\| _type == "category"` | Create, Update, Delete |
| Index to Algolia | `https://{your-url}/api/index-articles` | `_type == "article"` | Create, Update, Delete |

Set the HTTP header `sanity-webhook-signature` secret to your `SANITY_WEBHOOK_SECRET` value on both.

**Step 6 — Set GitHub Actions secrets** (for CI/CD)

In GitHub → Settings → Secrets → Actions, add:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel project settings → General → Team ID |
| `VERCEL_PROJECT_ID` | Vercel project settings → General → Project ID |
| `VERCEL_PRODUCTION_URL` | Your deployed URL |

After this, every push to `main` auto-deploys and runs Lighthouse CI.

## Local development

```bash
bash setup.sh       # install deps + create .env.local template
# fill in .env.local with credentials from above
bun dev             # http://localhost:3000
# Studio at http://localhost:3000/studio
```

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| CMS | Sanity v5 (hosted, free tier) |
| Search | Algolia v5 (free tier, 10k requests/mo) |
| Chatbot | Vercel AI SDK 6 + AI Gateway (Claude Sonnet 4.6 primary, GPT-4o fallback) |
| RAG store | Supabase Postgres + pgvector |
| Analytics | GA4 + custom events |
| Hosting | Vercel (free → Hobby for custom domain) |
| CI/CD | GitHub Actions + Lighthouse CI |

## AI Chatbot setup (GLO-13)

The chatbot is a streaming `/api/chat` route powered by the Vercel AI SDK,
routed through the Vercel AI Gateway, and grounded with RAG against the same
Sanity articles that feed the rest of the site.

**One-time setup:**

1. Provision Vercel Postgres on the project (Storage → Create → Postgres).
   `DATABASE_URL` is auto-injected into the Vercel env. For local dev, run
   `vercel env pull .env.local`.
2. Apply the schema: `DATABASE_URL=... bun scripts/migrate.ts`. This applies
   every `db/migrations/*.sql` file (creates the `vector` extension, the
   `kb_chunks` + `chat_session_usage` tables, and the retrieval / rate-limit
   RPCs).
3. Enable the Vercel AI Gateway on your project. The OIDC binding auto-injects
   `AI_GATEWAY_API_KEY` in production; for local dev, generate a token in the
   Vercel dashboard.
4. Generate a session-cookie secret: `openssl rand -hex 32` → set as
   `CHAT_SESSION_SECRET`.
5. Backfill embeddings for the existing knowledge base:

   ```bash
   AI_GATEWAY_API_KEY=xxx \
   DATABASE_URL=postgres://... \
   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
   bun scripts/embed-articles.ts
   ```

**Endpoints**

| Route | Purpose |
|---|---|
| `POST /api/chat/session` | Issues anonymous signed session cookie. Call once before first chat message. |
| `POST /api/chat` | Streaming chat (Vercel AI SDK UI message protocol). Requires session cookie. |

**Rate limits** (per session): 20 messages / 1h, 200 / 24h. Override via
`CHAT_RATE_LIMIT_1H` and `CHAT_RATE_LIMIT_24H`.

**Models** (configured in `src/lib/ai/gateway.ts`):

- Chat primary: `anthropic/claude-sonnet-4-6`
- Chat fallback: `openai/gpt-4o`
- Embeddings: `openai/text-embedding-3-small` (1536 dims)

The gateway is configured for `hipaaCompliant: true`, `zeroDataRetention: true`,
and `disallowPromptTraining: true` for HIPAA posture.

## Acceptance criteria

- [x] Build passes clean (`NODE_ENV=production bun run build`)
- [x] TypeScript clean
- [x] ISR: homepage every 5 min, articles on-demand via webhook
- [x] Full-text search with instant results
- [x] "Was this helpful?" feedback widget → Sanity
- [x] Related articles (tag-based)
- [x] SEO: canonical URLs, meta descriptions, Article schema
- [x] GA4 + custom events (search query, article view, feedback)
- [ ] Deployed to Vercel (pending env vars)
- [ ] Search latency < 500 ms p95 (pending deployment)
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95 (pending deployment)
- [ ] CMS editors can publish without engineering help (pending Sanity setup)
- [x] AI chatbot `/api/chat` route streams via Vercel AI SDK + Gateway
- [x] RAG retrieval against Supabase pgvector (top-5)
- [x] Anonymous signed session cookie gates `/api/chat`
- [x] Per-session rate limiting (20/h, 200/d)
- [x] Pre-input moderation (emergency, prompt injection, toxic deflection)
- [ ] Chat UI widget (GLO-14, owned by UX Designer)
- [ ] Final clinical disclaimer language signed off by CEO + Legal (PRD Q2)
- [ ] Escalation queue chosen by CEO (PRD Q3)
