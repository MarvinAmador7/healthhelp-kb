import { liteClient as algoliasearch } from "algoliasearch/lite";

export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export const ARTICLES_INDEX = "articles";

export const ALGOLIA_SEARCH_CONFIG = {
  hitsPerPage: 10,
  attributesToHighlight: ["title", "excerpt"],
  attributesToSnippet: ["excerpt:30"],
  highlightPreTag: "<mark>",
  highlightPostTag: "</mark>",
  facets: ["category", "articleType"],
};
