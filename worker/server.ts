// Worker de téléchargement Vidversal — API publique au format du front.
// POST   /info     { url }             -> { success, data }
// GET    /download ?url=&formatId=&audioOnly=&audioFormat=&videoFormat=&gif=&lang=&subtitleOnly=
// GET    /health
// Entrées sorties identiques à src/app/api/info + src/app/api/download de Next.js.

import { createServer, type ServerResponse } from "node:http";
import { stat, unlink } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { getVideoInfo, downloadVideo } from "./src/lib/ytdlp";

const PORT = Number(process.env.PORT || 4000);

// Filet de secours cobalt — utilisé quand yt-dlp échoue (YouTube "not a bot",
// HTTP 403 datacenter, URL non supportée...). Instance par défaut : celle de
// vidversal ; on peut pointer ailleurs via COBALT_API_URL.
const COBALT_ENABLED = true;
const COBALT_CLUSTER = (
  process.env.COBALT_API_URL || "https://cobalt-ra1w.onrender.com"
).replace(/\/$/, "");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

const SAFE_AUDIO = ["mp3", "flac", "wav", "aac", "opus"];
const SAFE_VIDEO = ["mp4", "webm", "mkv", "mov", "avi"];

const CONTENT_TYPES: Record<string, string> = {
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

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function errorBody(err: unknown): { error: string; details: string } {
  const message = err instanceof Error ? err.message : "Erreur inconnue";
  console.error("[worker]", message);
  return { error: "Échec du traitement", details: message };
}

function cobaltAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const key = process.env.COBALT_API_KEY;
  if (key) headers.Authorization = `Bearer ${key}`;
  return headers;
}

// Cobalt annonce un fichier dispo : on retourne des infos minimalistes pour
// l'aperçu ; le vrai fichier est récupéré au moment du /download.
async function cobaltInfo(target: string) {
  if (!COBALT_ENABLED) return null;
  try {
    const r = await fetch(`${COBALT_CLUSTER}/`, {
      method: "POST",
      headers: cobaltAuthHeaders(),
      body: JSON.stringify({ url: target, filenameStyle: "classic" }),
      signal: AbortSignal.timeout(45000),
    });
    const data = (await r.json().catch(() => null)) as {
      status?: string;
    } | null;
    if (!r.ok || !data || !["tunnel", "redirect", "picker", "local-processing"].includes(data.status || ""))
      return null;
    let host = "vidéo";
    try {
      host = new URL(target).hostname.replace(/^www\./, "");
    } catch {
      /* ignore */
    }
    return {
      id: String(Date.now()),
      title: `Vidéo (${host})`,
      thumbnail: "",
      duration: 0,
      uploader: "Cobalt",
      webpageUrl: target,
      formats: [],
      subtitles: [],
      platform: host,
      playlist: false,
      playlistItems: [],
      isShort: false,
      isReel: false,
    };
  } catch {
    return null;
  }
}

// Télécharge via cobalt et stream le fichier vers le client.
// Remap les formats audio demandés vers ceux que cobalt accepte.
const COBALT_AUDIO: Record<string, string> = {
  mp3: "mp3",
  wav: "wav",
  opus: "opus",
  flac: "wav",
  aac: "mp3",
  ogg: "ogg",
};

async function cobaltStream(
  res: ServerResponse,
  target: string,
  audioOnly: boolean,
  audioFormat: string
): Promise<void> {
  if (!COBALT_ENABLED) throw new Error("cobalt non configuré (COBALT_API_URL)");
  const body: Record<string, unknown> = {
    url: target,
    filenameStyle: "classic",
    disableMetadata: true,
  };
  if (audioOnly) {
    body.downloadMode = "audio";
    body.audioFormat = COBALT_AUDIO[audioFormat] || "mp3";
  } else {
    body.downloadMode = "auto";
    body.videoQuality = "max";
  }

  const r = await fetch(`${COBALT_CLUSTER}/`, {
    method: "POST",
    headers: cobaltAuthHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw new Error(`cobalt: HTTP ${r.status}`);
  const data = (await r.json()) as {
    status?: string;
    url?: string;
    filename?: string;
    error?: { code?: string };
    picker?: { type?: string; url?: string }[];
  };
  if (!data || data.status === "error")
    throw new Error(`cobalt: ${data?.error?.code || "erreur inconnue"}`);

  let url = "";
  let filename = data.filename || "";
  if (data.status === "picker") {
    const item = (data.picker || []).find(
      (p) => p.type === "video" || p.type === "gif"
    );
    url = item?.url || "";
  } else if (data.status === "tunnel" || data.status === "redirect") {
    url = data.url || "";
  }
  if (!url) throw new Error(`cobalt: réponse inattendue (${data.status})`);

  const upstream = await fetch(url, {
    signal: AbortSignal.timeout(600000),
  });
  if (!upstream.ok) throw new Error(`cobalt stream: HTTP ${upstream.status}`);

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const contentLength = upstream.headers.get("content-length") || undefined;
  const safeName = (filename || "vidversal-download.mp4").replace(/["\\]/g, "_");

  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": contentLength,
    "Content-Disposition": `attachment; filename="${safeName}"`,
    "Cache-Control": "no-store",
  });
  Readable.fromWeb(upstream.body as never).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");

  if (req.method === "OPTIONS") {
    for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === "/health" || url.pathname === "/") {
    json(res, 200, { ok: true, service: "vidversal-worker" });
    return;
  }

  // ---------- /info ----------
  if (url.pathname === "/info" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let parsed: { url?: unknown } = {};
    try {
      parsed = JSON.parse(body || "{}");
    } catch {
      json(res, 400, { error: "JSON invalide" });
      return;
    }
    const target = typeof parsed.url === "string" ? parsed.url.trim() : "";
    if (!target) {
      json(res, 400, { error: "URL requise" });
      return;
    }
    try {
      new URL(target);
    } catch {
      json(res, 400, { error: "URL invalide" });
      return;
    }
    try {
      const data = await getVideoInfo(target);
      json(res, 200, { success: true, data });
    } catch (err) {
      const fallback = await cobaltInfo(target);
      if (fallback) {
        json(res, 200, { success: true, data: fallback });
        return;
      }
      json(res, 500, errorBody(err));
    }
    return;
  }

  // ---------- /download ----------
  if (url.pathname === "/download" && (req.method === "GET" || req.method === "POST")) {
    const q = url.searchParams;
    const target = (q.get("url") || "").trim();
    if (!target) {
      json(res, 400, { error: "URL requise" });
      return;
    }
    try {
      new URL(target);
    } catch {
      json(res, 400, { error: "URL invalide" });
      return;
    }

    const audioOnly = q.get("audioOnly") === "true";
    const subtitleOnly = q.get("subtitleOnly") === "true";
    const gif = q.get("gif") === "true";
    const formatId = q.get("formatId") || undefined;
    const audioFormat = (q.get("audioFormat") || "mp3").toLowerCase();
    const videoFormat = (q.get("videoFormat") || "mp4").toLowerCase();
    const lang = q.get("lang") || undefined;

    if (!SAFE_AUDIO.includes(audioFormat)) {
      json(res, 400, { error: "Format audio non supporté" });
      return;
    }
    if (!SAFE_VIDEO.includes(videoFormat)) {
      json(res, 400, { error: "Format vidéo non supporté" });
      return;
    }

    let filePath: string;
    try {
      const result = await downloadVideo(target, {
        formatId,
        audioOnly,
        subtitleOnly,
        audioFormat: audioOnly ? audioFormat : undefined,
        videoFormat,
        gif,
        lang,
        embedSubtitles: Boolean(lang) && !subtitleOnly,
      });
      filePath = result.filePath;
    } catch (err) {
      try {
        await cobaltStream(res, target, audioOnly, audioOnly ? audioFormat : "mp3");
        return;
      } catch {
        // on garde l'erreur d'origine
      }
      json(res, 500, errorBody(err));
      return;
    }

    try {
      const info = await stat(filePath);
      const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
      const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
      const filename = filePath.slice(filePath.lastIndexOf("/") + 1);

      for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": info.size,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      });

      const stream = createReadStream(filePath);
      stream.pipe(res);

      const cleanup = () => unlink(filePath).catch(() => {});
      res.on("close", () => {
        stream.destroy();
        cleanup();
      });
      stream.on("error", cleanup);
      stream.on("end", cleanup);
    } catch (err) {
      json(res, 500, errorBody(err));
    }
    return;
  }

  json(res, 404, { error: "Route inconnue" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[vidversal-worker] prêt sur http://0.0.0.0:${PORT}`);
});