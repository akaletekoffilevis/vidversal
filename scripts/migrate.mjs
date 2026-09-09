// Applique supabase-schema-neon.sql sur la base Neon.
// Usage : node scripts/migrate.mjs
import fs from "node:fs";
import { Pool } from "@neondatabase/serverless";

const envRaw = fs.readFileSync(".env.local", "utf8");
const get = (key) => {
  const m = envRaw.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim() : undefined;
};

const connectionString = get("DATABASE_URL_UNPOOLED") || get("DATABASE_URL");
if (!connectionString) throw new Error("DATABASE_URL manquante dans .env.local");

const sql = fs.readFileSync("supabase-schema-neon.sql", "utf8");

const pool = new Pool({ connectionString });

try {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await pool.query(stmt);
    console.log("ok:", stmt.slice(0, 60));
  }
  console.log("\nMigration terminée.");
} finally {
  await pool.end();
}