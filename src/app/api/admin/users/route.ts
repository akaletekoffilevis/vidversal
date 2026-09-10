import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import { auth, hashPassword, pool } from "@/lib/auth";
import { deleteUserRow, ensureSchema, listUsers, logActivity, setUserColumns } from "@/lib/db";

const SAFE_TIERS = ["free", "pro"];
const SAFE_ROLES = ["user", "admin"];

async function getActor(): Promise<{ email: string } | null> {
  const session = await auth().catch(() => null);
  return session?.user?.email ? { email: session.user.email } : null;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});
  const { users, stats } = await listUsers().catch(() => ({ users: [], stats: { total: 0, verified: 0, pro: 0, banned: 0, admins: 0, downloadsToday: 0 } }));
  return NextResponse.json({ users, stats });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const tier = SAFE_TIERS.includes(String(body.tier)) ? String(body.tier) : "free";
  const role = SAFE_ROLES.includes(String(body.role)) ? String(body.role) : "user";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Mot de passe : 8 caractères minimum" }, { status: 400 });
  }

  const { rows } = await pool.query(`SELECT id FROM "User" WHERE lower(email) = lower($1) LIMIT 1`, [email]);
  if (rows[0]) return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });

  const userId = randomUUID();
  const accountId = randomUUID();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO "User"(id, name, email, email_verified, role, tier)
       VALUES ($1, $2, $3, true, $4, $5)`,
      [userId, name || email, email, role, tier]
    );
    await client.query(
      `INSERT INTO "Account"(id, "userId", type, provider, "providerAccountId", password_hash)
       VALUES ($1, $2, 'credentials', 'credentials', $3, $4)`,
      [accountId, userId, email, hashPassword(password)]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const actor = (await getActor())?.email ?? "admin";
  await logActivity(actor, "create_user", `Création de ${email} (${tier})`).catch(() => {});

  const { users, stats } = await listUsers();
  return NextResponse.json({ ok: true, users, stats });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  const target = await pool
    .query(`SELECT email, tier, role FROM "User" WHERE id = $1 LIMIT 1`, [id])
    .then((r) => r.rows[0] as { email: string; tier: string; role: string } | undefined)
    .catch(() => undefined);

  if (body.tier !== undefined) {
    if (!SAFE_TIERS.includes(String(body.tier))) return NextResponse.json({ error: "tier invalide" }, { status: 400 });
    patch.tier = body.tier;
  }
  if (body.role !== undefined) {
    if (!SAFE_ROLES.includes(String(body.role))) return NextResponse.json({ error: "rôle invalide" }, { status: 400 });
    patch.role = body.role;
  }
  if (body.banned !== undefined) patch.banned = Boolean(body.banned);
  if (typeof body.name === "string") patch.name = body.name.trim().slice(0, 80) || null;

  if (typeof body.email === "string" && body.email.trim()) {
    const email = body.email.trim().toLowerCase().slice(0, 200);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    const clash = await pool.query(`SELECT id FROM "User" WHERE lower(email) = lower($1) AND id <> $2 LIMIT 1`, [email, id]);
    if (clash.rows[0]) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    patch.email = email;
  }

  if (Object.keys(patch).length) {
    await setUserColumns(id, patch);
  }

  if (typeof body.password === "string" && body.password.length >= 8) {
    const email = (patch.email as string) ?? target?.email ?? "";
    const current = await pool.query(
      `SELECT id FROM "Account" WHERE "userId" = $1 AND provider = 'credentials' LIMIT 1`,
      [id]
    );
    if (current.rows[0]) {
      await pool.query(
        `UPDATE "Account" SET password_hash = $2, "providerAccountId" = $3 WHERE id = $1`,
        [current.rows[0].id as string, hashPassword(body.password), email]
      );
    } else if (email) {
      await pool.query(
        `INSERT INTO "Account"(id, "userId", type, provider, "providerAccountId", password_hash)
         VALUES ($1, $2, 'credentials', 'credentials', $3, $4)`,
        [randomUUID(), id, email, hashPassword(body.password)]
      );
    }
  }

  const actor = (await getActor())?.email ?? "admin";
  const detail = [] as string[];
  if (patch.tier !== undefined && target?.tier !== patch.tier) detail.push(`tier ${target?.tier}→${patch.tier}`);
  if (patch.banned !== undefined) detail.push(patch.banned ? "banni" : "réactivé");
  if (patch.email !== undefined && target?.email !== patch.email) detail.push(`email → ${patch.email}`);
  if (detail.length) {
    await logActivity(actor, "update_user", `${target?.email ?? id}: ${detail.join(", ")}`).catch(() => {});
  }

  const { users, stats } = await listUsers();
  return NextResponse.json({ ok: true, users, stats });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const target = await pool
    .query(`SELECT email FROM "User" WHERE id = $1 LIMIT 1`, [id])
    .then((r) => r.rows[0] as { email: string } | undefined)
    .catch(() => undefined);

  await deleteUserRow(id).catch(() => {});
  const actor = (await getActor())?.email ?? "admin";
  await logActivity(actor, "delete_user", `Suppression de ${target?.email ?? id}`).catch(() => {});

  const { users, stats } = await listUsers();
  return NextResponse.json({ ok: true, users, stats });
}