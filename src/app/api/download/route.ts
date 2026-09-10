import { NextRequest, NextResponse } from "next/server";
import { downloadVideo } from "@/lib/ytdlp";
import { getTier, assertAudioFormat, assertVideoFormat, isTierError } from "@/lib/tier";
import { recordDownload, ensureSchema } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const SAFE_AUDIO = ["mp3", "flac", "wav", "aac", "opus"];
const SAFE_VIDEO = ["mp4", "webm", "mkv", "mov", "avi"];

async function readResult(req: NextRequest): Promise<{ params: URLSearchParams; json: unknown }> {
  if (req.method === "GET") {
    return { params: req.nextUrl.searchParams, json: undefined };
  }
  const json = await req.json().catch(() => ({}));
  return { params: undefined as unknown as URLSearchParams, json };
}

function getStr(source: URLSearchParams | Record<string, unknown>, key: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const v = source[key];
  return typeof v === "string" ? v : undefined;
}

function getBool(source: URLSearchParams | Record<string, unknown>, key: string): boolean {
  if (source instanceof URLSearchParams) return source.get(key) === "true";
  return source[key] === true;
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  try {
    const { params, json } = await readResult(req);
    const source = params || (json as Record<string, unknown>);

    const url = getStr(source, "url");
    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    const formatId = getStr(source, "formatId");
    const audioOnly = getBool(source, "audioOnly");
    const subtitleOnly = getBool(source, "subtitleOnly");
    const gif = getBool(source, "gif");

    const audioFormat = (getStr(source, "audioFormat") || "mp3").toLowerCase() as "mp3" | "flac" | "wav" | "aac" | "opus";
    if (!SAFE_AUDIO.includes(audioFormat))
      return NextResponse.json({ error: "Format audio non supporté" }, { status: 400 });

    const videoFormat = (getStr(source, "videoFormat") || "mp4").toLowerCase() as "mp4" | "webm" | "mkv" | "mov" | "avi";
    if (!SAFE_VIDEO.includes(videoFormat))
      return NextResponse.json({ error: "Format vidéo non supporté" }, { status: 400 });

    const lang = getStr(source, "lang");

    const tier = await getTier();

    if (tier.banned) {
      return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
    }

    // --- Quota journalier (comptes connectés) ---
    if (tier.userId) {
      const daily = tier.limits.dailyDownloads;
      if (daily > 0 && tier.usageToday >= daily) {
        return NextResponse.json(
          {
            error: "Quota quotidien atteint — passez à PRO pour télécharger sans limite",
            code: "DAILY_LIMIT",
          },
          { status: 429 }
        );
      }
    }

    // --- Gating premium ---
    if (audioFormat !== "mp3") assertAudioFormat(tier.tier, audioFormat, tier.limits);
    if (videoFormat !== "mp4") assertVideoFormat(tier.tier, videoFormat, tier.limits);
    if (gif && !tier.limits.gif)
      throw new Error("La création de GIF est réservée aux membres PRO");
    if ((lang || subtitleOnly) && !tier.limits.subtitles)
      throw new Error("Les sous-titres sont réservés aux membres PRO");

    const { filePath, filename } = await downloadVideo(url, {
      formatId,
      audioOnly,
      subtitleOnly,
      audioFormat: audioOnly ? audioFormat : undefined,
      videoFormat: videoFormat,
      gif,
      lang,
      embedSubtitles: Boolean(lang) && !subtitleOnly,
    });

    const fileBuffer = await fs.readFile(filePath);
    await fs.unlink(filePath).catch(() => {});

    // --- Limite de taille du plan ---
    const maxBytes = tier.limits.maxFileSizeMB * 1024 * 1024;
    if (maxBytes > 0 && fileBuffer.byteLength > maxBytes) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux (max ${tier.limits.maxFileSizeMB} Mo sur le plan ${tier.tier})`,
          code: "SIZE_LIMIT",
        },
        { status: 429 }
      );
    }

    // --- Historique (comptes connectés) ---
    if (tier.userId && filename) {
      await ensureSchema().catch(() => {});
      const hostname = new URL(url).hostname;
      await recordDownload(tier.userId, {
        url,
        title: stripExt(filename),
        platform: hostname,
        format: audioOnly ? `audio:${audioFormat}` : subtitleOnly ? "subtitle" : gif ? "gif" : `video:${videoFormat}`,
        quality: formatId || undefined,
        size_bytes: fileBuffer.byteLength,
      }).catch(() => {});
    }

    let contentType = "application/octet-stream";
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".mp3": "audio/mpeg",
      ".flac": "audio/flac",
      ".wav": "audio/wav",
      ".aac": "audio/aac",
      ".opus": "audio/opus",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".gif": "image/gif",
      ".srt": "application/x-subrip",
      ".vtt": "text/vtt",
    };
    contentType = contentTypes[ext] || contentType;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    if (isTierError(error)) {
      return NextResponse.json(
        { error: error.message, code: "PRO_REQUIRED" },
        { status: 402 }
      );
    }
    if (isDownloadLimitError(error)) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Échec du téléchargement", details: message },
      { status: 500 }
    );
  }
}

function isDownloadLimitError(error: unknown): error is Error {
  return error instanceof Error && "code" in error && (error as Error & { code?: string }).code === "LIMIT";
}

function stripExt(name: string): string {
  return name.replace(/\.[^/.]+$/, "");
}