import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { countDownloadsToday, ensureSchema, getDbUserById, listDownloads, recordDownload } from "@/lib/db";

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const id = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 200);
  const items = await listDownloads(id, limit).catch(() => []);
  const usageToday = await countDownloadsToday(id).catch(() => 0);
  return NextResponse.json({ items, usageToday });
}

export async function POST(req: NextRequest) {
  await ensureSchema().catch(() => {});
  const session = await auth().catch(() => null);
  const id = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const user = await getDbUserById(id).catch(() => null);
  if (user?.banned) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const url = typeof body.url === "string" ? body.url.slice(0, 500) : undefined;
  if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

  await recordDownload(id, {
    url,
    title: typeof body.title === "string" ? body.title.slice(0, 200) : undefined,
    platform: typeof body.platform === "string" ? body.platform.slice(0, 80) : undefined,
    format: typeof body.format === "string" ? body.format.slice(0, 40) : undefined,
    quality: typeof body.quality === "string" ? body.quality.slice(0, 40) : undefined,
    size_bytes: typeof body.size_bytes === "number" ? body.size_bytes : undefined,
  });

  const items = await listDownloads(id, 50).catch(() => []);
  const usageToday = await countDownloadsToday(id).catch(() => 0);
  return NextResponse.json({ ok: true, items, usageToday });
}