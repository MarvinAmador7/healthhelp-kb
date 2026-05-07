import { NextRequest, NextResponse } from "next/server";
import { algoliasearch } from "algoliasearch";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  // Accept either naming convention; fall back to admin key (server-side route is safe)
  const apiKey =
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ??
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ??
    process.env.ALGOLIA_ADMIN_KEY!;
  const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, apiKey);

  const filters: string[] = [];
  if (category) filters.push(`category:"${category}"`);
  if (type) filters.push(`articleType:"${type}"`);

  const result = await client.searchSingleIndex({
    indexName: "articles",
    searchParams: {
      query,
      page,
      hitsPerPage: 10,
      filters: filters.join(" AND "),
      facets: ["category", "articleType"],
      attributesToHighlight: ["title", "excerpt"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    },
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
