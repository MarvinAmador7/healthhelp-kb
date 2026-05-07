/**
 * Embed all Sanity articles into the Vercel Postgres pgvector store.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
 *   NEXT_PUBLIC_SANITY_DATASET=production \
 *   DATABASE_URL=postgres://... \
 *   AI_GATEWAY_API_KEY=xxx \
 *   bun scripts/embed-articles.ts
 *
 * Re-run any time KB content changes. The Sanity webhook (POST /api/index-articles)
 * also triggers per-article re-embedding on publish in production. For a
 * server-side bulk run on Vercel, hit POST /api/admin/embed-articles with the
 * CHAT_ADMIN_SECRET bearer token.
 */
import { embedAllArticles } from "../src/lib/ai/embed-articles";

async function main() {
  const result = await embedAllArticles({
    log: (line) => console.log(`  ${line}`),
  });
  console.log(
    `\n✅ Embedded ${result.articles} articles → ${result.chunks} chunks (${result.skipped} skipped)`,
  );
}

main().catch((err) => {
  console.error("Embedding failed:", err);
  process.exit(1);
});
