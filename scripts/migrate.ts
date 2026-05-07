/**
 * Apply every db/migrations/*.sql file in lexical order. Idempotent — each
 * migration uses `if not exists` / `or replace`, so re-running is safe.
 *
 *   DATABASE_URL=postgres://... bun scripts/migrate.ts
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL must be set");
    process.exit(1);
  }
  const sql = postgres(url, { max: 1, prepare: false });

  const files = (await readdir(DIR)).filter((f) => f.endsWith(".sql")).sort();
  console.log(`📦 Applying ${files.length} migration(s) from ${DIR}\n`);

  for (const file of files) {
    const path = join(DIR, file);
    const body = await readFile(path, "utf8");
    console.log(`  → ${file}`);
    await sql.unsafe(body);
  }

  console.log(`\n✅ Migrations applied`);
  await sql.end();
}

main().catch(async (err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
