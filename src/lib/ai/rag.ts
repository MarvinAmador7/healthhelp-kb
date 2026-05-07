import { embed } from "ai";

import { getSql } from "@/lib/db/server";
import {
  EMBEDDING_MODEL,
  gatewayEmbeddingProviderOptions,
} from "./gateway";

export interface RetrievedChunk {
  id: string;
  article_id: string;
  article_slug: string;
  article_title: string;
  category_slug: string | null;
  chunk_idx: number;
  content: string;
  similarity: number;
  clinically_reviewed: boolean;
  updated_at: string;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  context: string;
  citations: Citation[];
}

export interface Citation {
  index: number;
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  similarity: number;
}

const DEFAULT_TOP_K = 5;
const SIMILARITY_THRESHOLD = 0.2;

/** Embed the user query and retrieve the top-k most relevant KB chunks. */
export async function retrieveContext(
  query: string,
  options: { topK?: number } = {}
): Promise<RetrievalResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { chunks: [], context: "", citations: [] };
  }

  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: trimmed,
    providerOptions: gatewayEmbeddingProviderOptions,
  });

  const sql = getSql();
  const topK = options.topK ?? DEFAULT_TOP_K;

  // pgvector requires the literal "[1,2,3]" string form when binding through a
  // text parameter, then casts to vector inside the SQL.
  const queryVector = `[${(embedding as number[]).join(",")}]`;

  let rows: RetrievedChunk[];
  try {
    rows = (await sql<RetrievedChunk[]>`
      select * from match_kb_chunks(
        ${queryVector}::vector,
        ${topK}::int,
        ${SIMILARITY_THRESHOLD}::float
      )
    `) as unknown as RetrievedChunk[];
  } catch (error) {
    console.error("[rag] match_kb_chunks failed:", error);
    return { chunks: [], context: "", citations: [] };
  }

  return {
    chunks: rows,
    context: formatContext(rows),
    citations: rows.map((c, i) => ({
      index: i + 1,
      articleId: c.article_id,
      articleSlug: c.article_slug,
      articleTitle: c.article_title,
      similarity: c.similarity,
    })),
  };
}

function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((c, i) => {
      const reviewed = c.clinically_reviewed
        ? " (clinically reviewed)"
        : "";
      return `[${i + 1}] ${c.article_title}${reviewed}\nslug: ${c.article_slug}\n---\n${c.content}`;
    })
    .join("\n\n");
}
