import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addFavorite, ensureSchema, listFavorites, removeFavorite } from "@/lib/db";

export async function GET() {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const id = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const items = await listFavorites(id).catch(() => []);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const id = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const url = typeof body.url === "string" ? body.url.trim().slice(0, 500) : undefined;
  if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

  await addFavorite(id, {
    url,
    title: typeof body.title === "string" ? body.title.slice(0, 200) : undefined,
    platform: typeof body.platform === "string" ? body.platform.slice(0, 80) : undefined,
  });

  const items = await listFavorites(id).catch(() => []);
  return NextResponse.json({ ok: true, items });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const id = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const url = typeof body.url === "string" ? body.url : undefined;
  if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

  await removeFavorite(id, url);
  const items = await listFavorites(id).catch(() => []);
  return NextResponse.json({ ok: true, items });
}