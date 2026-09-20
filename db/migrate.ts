// Applies db/schema.sql. No migration framework -- for a 10-hour scope with
// one evolving schema, a single idempotent (create-if-not-exists) SQL file
// is easier to read and review than a chain of migration files.
//
// Run with: npm run db:migrate

try {
  process.loadEnvFile();
} catch {
  // no .env file -- assume DATABASE_URL is already in the environment
}

import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

async function main() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(sql);
    console.log("Schema applied.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
