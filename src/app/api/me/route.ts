import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { countDownloadsToday, deleteUserRow, ensureSchema, getDbUserById, logActivity, setUserColumns } from "@/lib/db";
import { getPlanConfig, resolveLimits } from "@/lib/plans";

function requireUser(session: unknown): { id: string } | null {
  const s = session as { user?: { id?: string } } | null;
  return s?.user?.id ? { id: s.user.id } : null;
}

export async function GET() {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const u = requireUser(session);
  if (!u) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const user = await getDbUserById(u.id).catch(() => null);
  if (!user) return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });

  const plan = await getPlanConfig().catch(() => null);
  const limits = plan ? resolveLimits(user.tier, plan) : null;
  const usageToday = await countDownloadsToday(u.id).catch(() => 0);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tier: user.tier,
    banned: user.banned,
    emailVerified: user.email_verified,
    avatar_emoji: user.avatar_emoji,
    lang: user.lang,
    theme: user.theme,
    createdAt: user.created_at,
    usageToday,
    plans: plan,
    limits,
  });
}

export async function PATCH(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const u = requireUser(session);
  if (!u) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    const name = body.name.trim().slice(0, 80);
    patch.name = name || null;
  }
  if (typeof body.avatar_emoji === "string") {
    patch.avatar_emoji = body.avatar_emoji.trim().slice(0, 16) || null;
  }
  if (typeof body.lang === "string") {
    patch.lang = ["fr", "en"].includes(body.lang) ? body.lang : null;
  }
  if (typeof body.theme === "string") {
    patch.theme = ["light", "dark", "system"].includes(body.theme) ? body.theme : "system";
  }

  if (Object.keys(patch).length) {
    await setUserColumns(u.id, patch).catch(() => {});
  }

  const user = await getDbUserById(u.id).catch(() => null);
  return NextResponse.json({ ok: true, user });
}

export async function DELETE() {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const u = requireUser(session);
  if (!u) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const user = await getDbUserById(u.id).catch(() => null);
  await deleteUserRow(u.id).catch(() => {});
  await logActivity(user?.email ?? "unknown", "delete_account", "Suppression de son propre compte").catch(() => {});
  return NextResponse.json({ ok: true });
}