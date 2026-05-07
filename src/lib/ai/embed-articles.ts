// Shared embedding-backfill logic. Used by both the CLI script
// (scripts/embed-articles.ts) and the admin API route
// (src/app/api/admin/embed-articles/route.ts) so both paths produce the
// same kb_chunks rows.

import { createClient } from "@sanity/client";
import { embedMany } from "ai";
import postgres from "postgres";

import { EMBEDDING_MODEL, gatewayEmbeddingProviderOptions } from "./gateway";

const ALL_ARTICLES_QUERY = `*[_type == "article"] {
  _id,
  title,
  "slug": slug.current,
  clinicallyReviewed,
  updatedAt,
  "category": category->{ "slug": slug.current },
  body
}`;

type SanityBlock = {
  _type: string;
  children?: { text?: string }[];
};

type SanityArticle = {
  _id: string;
  title: string;
  slug: string;
  clinicallyReviewed: boolean | null;
  updatedAt: string | null;
  category: { slug: string } | null;
  body: SanityBlock[];
};

// Roughly 4 chars per token; 512 tokens ≈ 2048 chars. Overlap 64 tokens ≈ 256.
const CHUNK_CHARS = 2048;
const CHUNK_OVERLAP_CHARS = 256;
const APPROX_CHARS_PER_TOKEN = 4;

function flatten(body: SanityBlock[]): string {
  if (!Array.isArray(body)) return "";
  return body
    .filter((b) => b._type === "block")
    .flatMap((b) => (b.children ?? []).map((c) => c.text ?? ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Chunk {
  idx: number;
  content: string;
  tokenCount: number;
}

function chunkText(text: string): Chunk[] {
  if (!text) return [];
  const chunks: Chunk[] = [];
  let start = 0;
  let idx = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_CHARS, text.length);
    const slice = text.slice(start, end).trim();
    if (slice) {
      chunks.push({
        idx,
        content: slice,
        tokenCount: Math.ceil(slice.length / APPROX_CHARS_PER_TOKEN),
      });
      idx += 1;
    }
    if (end >= text.length) break;
    start = end - CHUNK_OVERLAP_CHARS;
  }
  return chunks;
}

export interface EmbedAllResult {
  articles: number;
  chunks: number;
  skipped: number;
}

export async function embedAllArticles(opts?: {
  log?: (line: string) => void;
}): Promise<EmbedAllResult> {
  const log = opts?.log ?? (() => {});

  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    useCdn: false,
  });

  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
  });

  try {
    log("Fetching articles from Sanity...");
    const articles: SanityArticle[] = await sanity.fetch(ALL_ARTICLES_QUERY);
    log(`Found ${articles.length} articles`);

    let totalChunks = 0;
    let skipped = 0;
    for (const article of articles) {
      const text = `${article.title}\n\n${flatten(article.body)}`;
      const chunks = chunkText(text);
      if (chunks.length === 0) {
        log(`· ${article.slug}: no body, skipping`);
        skipped += 1;
        continue;
      }

      log(`· ${article.slug}: ${chunks.length} chunks`);
      const { embeddings } = await embedMany({
        model: EMBEDDING_MODEL,
        values: chunks.map((c) => c.content),
        providerOptions: gatewayEmbeddingProviderOptions,
      });

      // Replace existing chunks for this article so re-runs are idempotent.
      await sql.begin(async (tx) => {
        await tx`delete from kb_chunks where article_id = ${article._id}`;

        const updatedAt = article.updatedAt ?? new Date().toISOString();
        const reviewed = article.clinicallyReviewed ?? false;
        const categorySlug = article.category?.slug ?? null;

        for (let i = 0; i < chunks.length; i++) {
          const c = chunks[i];
          const embeddingLiteral = `[${embeddings[i].join(",")}]`;
          await tx`
            insert into kb_chunks (
              id, article_id, article_slug, article_title,
              category_slug, chunk_idx, content, token_count,
              embedding, clinically_reviewed, updated_at
            ) values (
              ${`${article._id}:${c.idx}`},
              ${article._id},
              ${article.slug},
              ${article.title},
              ${categorySlug},
              ${c.idx},
              ${c.content},
              ${c.tokenCount},
              ${embeddingLiteral}::vector,
              ${reviewed},
              ${updatedAt}
            )
          `;
        }
      });
      totalChunks += chunks.length;
    }

    return { articles: articles.length, chunks: totalChunks, skipped };
  } finally {
    await sql.end();
  }
}
