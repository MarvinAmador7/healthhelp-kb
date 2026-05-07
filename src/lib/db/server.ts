import postgres, { type Sql } from "postgres";

let cached: Sql | null = null;

// Vercel Postgres exposes the connection string as `DATABASE_URL`. Pooled
// connections are required on serverless — Neon-style URLs already include
// `?sslmode=require`, which `postgres` honours automatically.
export function getSql(): Sql {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set for server-side database access");
  }
  cached = postgres(url, {
    // Keep the pool small — Next.js serverless functions can spin up many
    // concurrent isolates and each one shouldn't hold a fan of connections.
    max: 5,
    idle_timeout: 20,
    prepare: false,
  });
  return cached;
}
