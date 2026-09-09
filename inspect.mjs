import fs from "node:fs";
import { Pool } from "@neondatabase/serverless";
const envRaw = fs.readFileSync(".env.local", "utf8");
const get = (k) => { const m = envRaw.match(new RegExp(`^${k}=([^\\n]*)`, "m")); return m ? m[1].trim() : undefined; };
const cs = get("DATABASE_URL_UNPOOLED") || get("DATABASE_URL");
const pool = new Pool({ connectionString: cs });
for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    for (const table of ["User", "Account", "VerificationToken", "Session"]) {
      const { rows } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table]);
      console.log("## " + table + ": " + rows.map(r => r.column_name).join(", "));
    }
    process.exit(0);
  } catch (e) {
    console.error("attempt", attempt, "failed:", e.message || "network");
    await new Promise(r => setTimeout(r, 4000));
  }
}
console.error("GIVING UP");
process.exit(1);
