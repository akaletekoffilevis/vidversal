import { NextRequest, NextResponse } from "next/server";
import { downloadVideo } from "@/lib/ytdlp";
import { getTier, assertAudioFormat, assertVideoFormat, isTierError } from "@/lib/tier";
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

    // --- Gating premium ---
    if (audioFormat !== "mp3") assertAudioFormat(tier.tier, audioFormat);
    if (videoFormat !== "mp4") assertVideoFormat(tier.tier, videoFormat);
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