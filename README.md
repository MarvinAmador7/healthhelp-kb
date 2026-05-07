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
| Analytics | GA4 + custom events |
| Hosting | Vercel (free → Hobby for custom domain) |
| CI/CD | GitHub Actions + Lighthouse CI |

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
