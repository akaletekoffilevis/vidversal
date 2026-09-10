import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { ensureSchema, logActivity } from "@/lib/db";
import { AudioFormat, getPlanConfig, normalizePlanConfig, resetPlanConfigCache, setPlanConfig, VideoFormat } from "@/lib/plans";

const AUDIO = ["mp3", "flac", "wav", "aac", "opus"];
const VIDEO = ["mp4", "webm", "mkv", "mov", "avi"];

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});
  const config = await getPlanConfig().catch(() => null);
  if (!config) return NextResponse.json({ error: "Configuration indisponible" }, { status: 503 });
  return NextResponse.json(config);
}

function sanitizeLimits(raw: unknown): object {
  const src = (raw ?? {}) as Record<string, unknown>;
  const pick = (key: string, fallback: number) => {
    const n = Number(src[key]);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const audio = (Array.isArray(src.audioFormats) ? src.audioFormats : [])
    .filter((f): f is AudioFormat => AUDIO.includes(String(f)));
  const video = (Array.isArray(src.videoFormats) ? src.videoFormats : [])
    .filter((f): f is VideoFormat => VIDEO.includes(String(f)));
  return {
    maxQuality: Math.max(144, pick("maxQuality", 1080)),
    maxDurationSec: Math.max(0, pick("maxDurationSec", 900)),
    batchSize: Math.max(1, Math.floor(pick("batchSize", 1))),
    audioFormats: audio.length ? audio : ["mp3"],
    videoFormats: video.length ? video : ["mp4"],
    gif: Boolean(src.gif),
    subtitles: Boolean(src.subtitles),
    playlist: Boolean(src.playlist),
    dailyDownloads: Math.max(0, Math.floor(pick("dailyDownloads", 10))),
    maxFileSizeMB: Math.max(1, Math.floor(pick("maxFileSizeMB", 512))),
    parallelDownloads: Math.max(1, Math.floor(pick("parallelDownloads", 1))),
  };
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const current = await getPlanConfig().catch(() => null);

  const free = sanitizeLimits((body as { free?: unknown }).free ?? current?.free);
  const pro = sanitizeLimits((body as { pro?: unknown }).pro ?? current?.pro);
  const pricingRaw = (body as { pricing?: Record<string, unknown> }).pricing ?? current?.pricing ?? {};
  const pricing = {
    monthlyPriceEur: Number(pricingRaw.monthlyPriceEur) || 9.99,
    yearlyPriceEur: Number(pricingRaw.yearlyPriceEur) || 79,
  };

  const config = normalizePlanConfig({ free, pro, pricing });
  await setPlanConfig(config);
  resetPlanConfigCache();

  const session = await auth().catch(() => null);
  const actor = session?.user?.email ?? "admin";
  await logActivity(actor, "plan_update", "Mise à jour de la configuration des plans").catch(() => {});

  return NextResponse.json({ ok: true, config });
}