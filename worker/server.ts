// Worker de téléchargement Vidversal — API publique au format du front.
// POST   /info     { url }             -> { success, data }
// GET    /download ?url=&formatId=&audioOnly=&audioFormat=&videoFormat=&gif=&lang=&subtitleOnly=
// GET    /health
// Entrées sorties identiques à src/app/api/info + src/app/api/download de Next.js.

import { createServer } from "node:http";
import { stat, unlink } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { getVideoInfo, downloadVideo } from "./src/lib/ytdlp";

const PORT = Number(process.env.PORT || 4000);

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