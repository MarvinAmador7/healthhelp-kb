// Vercel AI Gateway routing config.
//
// Models are referenced by their gateway slugs, which the AI SDK auto-routes
// through the Vercel AI Gateway when AI_GATEWAY_API_KEY (or the Vercel OIDC
// binding) is present. We expose explicit primary/fallback IDs and a single
// `gatewayProviderOptions` blob so /api/chat and the embedding script stay in
// lockstep.

export const CHAT_PRIMARY_MODEL = "anthropic/claude-sonnet-4-6" as const;
export const CHAT_FALLBACK_MODEL = "openai/gpt-4o" as const;
export const EMBEDDING_MODEL = "openai/text-embedding-3-small" as const;
export const EMBEDDING_DIMENSIONS = 1536 as const;

// Provider options consumed by streamText/generateText for the gateway
// provider. The `order` array enables automatic provider fallback: if the
// primary provider errors or times out, the gateway tries the next one.
export const gatewayProviderOptions = {
  gateway: {
    order: ["anthropic", "openai"],
  },
};

// Same shape but for embedding calls — providers list reduces to just openai
// since text-embedding-3-small is OpenAI-only.
export const gatewayEmbeddingProviderOptions = {
  gateway: {
    order: ["openai"],
  },
};
