import { pool } from "./auth";

// Schéma ajouté à chaud (idempotent) — l'admin_settings/plans et l'extension du
// compte utilisateur sont créés ici pour auto-réparer la base Neon sans passer
// par une migration manuelle à distance.

type AnyRecord = Record<string, unknown>;

let schemaPromise: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await pool.query(`
        ALTER TABLE "User"
          ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free',
          ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
          ADD COLUMN IF NOT EXISTS avatar_emoji text,
          ADD COLUMN IF NOT EXISTS lang text,
          ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'system',
          ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "downloads" (
          id bigserial PRIMARY KEY,
          "userId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          url text,
          title text,
          platform text,
          format text,
          quality text,
          size_bytes bigint,
          status text NOT NULL DEFAULT 'completed',
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_downloads_user
        ON "downloads"("userId", created_at DESC)
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "favorites" (
          id bigserial PRIMARY KEY,
          "userId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          url text NOT NULL,
          title text,
          platform text,
          created_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE("userId", url)
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "activity_log" (
          id bigserial PRIMARY KEY,
          actor text,
          action text NOT NULL,
          detail text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_activity_created
        ON "activity_log"(created_at DESC)
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "admin_settings" (
          key text PRIMARY KEY,
          value jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
    })();
  }
  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    console.error("[db] ensureSchema failed:", error);
    throw error;
  }
}

export async function logActivity(
  actor: string,
  action: string,
  detail?: string
): Promise<void> {
  await ensureSchema().catch(() => {});
  await pool
    .query(
      `INSERT INTO "activity_log"(actor, action, detail)
       VALUES ($1, $2, $3)`,
      [actor, action, detail ?? null]
    )
    .catch(() => {});
}

export interface DbUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  tier: "free" | "pro";
  banned: boolean;
  email_verified: boolean;
  avatar_emoji: string | null;
  lang: string | null;
  theme: string | null;
  created_at: string | null;
}

export async function getDbUserByEmail(email: string): Promise<DbUser | null> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.image, COALESCE(u.role, 'user') AS role,
            COALESCE(u.tier, 'free') AS tier, COALESCE(u.banned, false) AS banned,
            COALESCE(u.email_verified, false) AS email_verified,
            u.avatar_emoji, u.lang, u.theme, u.created_at
     FROM "User" u WHERE lower(u.email) = lower($1) LIMIT 1`,
    [email]
  );
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function getDbUserById(id: string): Promise<DbUser | null> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.image, COALESCE(u.role, 'user') AS role,
            COALESCE(u.tier, 'free') AS tier, COALESCE(u.banned, false) AS banned,
            COALESCE(u.email_verified, false) AS email_verified,
            u.avatar_emoji, u.lang, u.theme, u.created_at
     FROM "User" u WHERE u.id = $1 LIMIT 1`,
    [id]
  );
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function countDownloadsToday(userId: string): Promise<number> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT count(*)::int AS n
     FROM "downloads"
     WHERE "userId" = $1
       AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')`,
    [userId]
  );
  return Number(rows[0]?.n ?? 0);
}

export interface DownloadRecord {
  id: number;
  url: string | null;
  title: string | null;
  platform: string | null;
  format: string | null;
  quality: string | null;
  size_bytes: number | null;
  created_at: string;
}

export async function listDownloads(
  userId: string,
  limit = 50
): Promise<DownloadRecord[]> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT id, url, title, platform, format, quality, size_bytes, created_at
     FROM "downloads" WHERE "userId" = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows as DownloadRecord[];
}

export async function recordDownload(
  userId: string,
  data: {
    url?: string;
    title?: string;
    platform?: string;
    format?: string;
    quality?: string;
    size_bytes?: number;
  }
): Promise<void> {
  await ensureSchema().catch(() => {});
  await pool
    .query(
      `INSERT INTO "downloads"("userId", url, title, platform, format, quality, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        data.url ?? null,
        data.title ?? null,
        data.platform ?? null,
        data.format ?? null,
        data.quality ?? null,
        data.size_bytes ?? null,
      ]
    )
    .catch(() => {});
}

export interface FavoriteRecord {
  id: number;
  url: string;
  title: string | null;
  platform: string | null;
  created_at: string;
}

export async function listFavorites(userId: string): Promise<FavoriteRecord[]> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT id, url, title, platform, created_at
     FROM "favorites" WHERE "userId" = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows as FavoriteRecord[];
}

export async function addFavorite(
  userId: string,
  data: { url: string; title?: string; platform?: string }
): Promise<void> {
  await ensureSchema().catch(() => {});
  await pool
    .query(
      `INSERT INTO "favorites"("userId", url, title, platform)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("userId", url) DO NOTHING`,
      [userId, data.url, data.title ?? null, data.platform ?? null]
    )
    .catch(() => {});
}

export async function removeFavorite(userId: string, url: string): Promise<void> {
  await ensureSchema().catch(() => {});
  await pool.query(
    `DELETE FROM "favorites" WHERE "userId" = $1 AND url = $2`,
    [userId, url]
  ).catch(() => {});
}

export async function getSetting<T>(key: string): Promise<T | null> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT value FROM "admin_settings" WHERE key = $1 LIMIT 1`,
    [key]
  );
  if (!rows[0]) return null;
  return (rows[0].value as T) ?? null;
}

export async function setSetting(key: string, value: AnyRecord): Promise<void> {
  await ensureSchema().catch(() => {});
  await pool.query(
    `INSERT INTO "admin_settings"(key, value, updated_at)
     VALUES ($1, $2::jsonb, now()) ON CONFLICT (key)
     DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}

export interface AdminUserRow extends DbUser {
  provider: string | null;
  created_at: string | null;
}

export interface UserStats {
  total: number;
  verified: number;
  pro: number;
  banned: number;
  admins: number;
  downloadsToday: number;
}

export async function listUsers(): Promise<{ users: AdminUserRow[]; stats: UserStats }> {
  await ensureSchema().catch(() => {});
  const usersResult = await pool.query(
    `SELECT u.id, u.name, u.email, u.image, COALESCE(u.role, 'user') AS role,
            COALESCE(u.tier, 'free') AS tier, COALESCE(u.banned, false) AS banned,
            COALESCE(u.email_verified, false) AS email_verified,
            u.avatar_emoji, u.lang, u.theme, u.created_at,
            (SELECT a.provider FROM "Account" a
             WHERE a.userid = u.id LIMIT 1) AS provider
     FROM "User" u
     ORDER BY u.created_at DESC NULLS LAST, u.email ASC`
  );
  const statsResult = await pool.query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE email_verified)::int AS verified,
       count(*) FILTER (WHERE tier = 'pro')::int AS pro,
       count(*) FILTER (WHERE banned)::int AS banned,
       count(*) FILTER (WHERE role = 'admin')::int AS admins
     FROM "User"`
  );
  const today = await pool.query(
    `SELECT count(*)::int AS n FROM "downloads"
     WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')`
  );
  const stats = {
    ...(statsResult.rows[0] as Omit<UserStats, "downloadsToday">),
    downloadsToday: Number(today.rows[0]?.n ?? 0),
  } as UserStats;
  return { users: usersResult.rows as AdminUserRow[], stats };
}

export async function setUserColumns(
  id: string,
  patch: {
    tier?: string;
    role?: string;
    banned?: boolean;
    name?: string | null;
    email?: string | null;
    avatar_emoji?: string | null;
    lang?: string | null;
    theme?: string | null;
  }
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  const entries = Object.entries(patch) as [keyof typeof patch, unknown][];
  for (const [k, v] of entries) {
    if (v === undefined) continue;
    vals.push(v);
    sets.push(`"${k}" = $${vals.length}`);
  }
  if (!sets.length) return;
  vals.push(id);
  await pool.query(`UPDATE "User" SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
}

export async function deleteUserRow(id: string): Promise<void> {
  await pool.query(`DELETE FROM "User" WHERE id = $1`, [id]);
}

export async function listActivity(limit = 100): Promise<AnyRecord[]> {
  await ensureSchema().catch(() => {});
  const { rows } = await pool.query(
    `SELECT id, actor, action, detail, created_at
     FROM "activity_log" ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}