import { NextRequest, NextResponse } from "next/server";
import { algoliasearch } from "algoliasearch";

export interface AutocompleteSuggestion {
  objectID: string;
  title: string;
  slug: string;
  category: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey =
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ??
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ??
    process.env.ALGOLIA_ADMIN_KEY!;
  const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!, apiKey);

  const result = await client.searchSingleIndex({
    indexName: "articles",
    searchParams: {
      query,
      hitsPerPage: 5,
      attributesToRetrieve: ["title", "slug", "category"],
      attributesToHighlight: [],
    },
  });

  const suggestions: AutocompleteSuggestion[] = (result.hits as Array<{
    objectID: string;
    title: string;
    slug: string;
    category: string;
  }>).map((hit) => ({
    objectID: hit.objectID,
    title: hit.title,
    slug: hit.slug,
    category: hit.category,
  }));

  return NextResponse.json({ suggestions }, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
