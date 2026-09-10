import { execFile } from "child_process";
import { promisify } from "util";
import { VideoInfo, VideoFormat } from "./types";
import path from "path";
import os from "os";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);
const DOWNLOAD_DIR = path.join(os.tmpdir(), "vidversal-downloads");

// YouTube renvoie parfois 403 sur les IP de datacenter (Render, VPS...).
// Le client "android" (et repli web) contourne ce blocage sans compromettre
// les autres plateformes (ignoré par les extracteurs non-YouTube).
const YT_EXTRACTOR_ARGS = [
  "--extractor-args",
  "youtube:player_client=android,web",
];

// Le PETIT PLUS qui règle "Sign in to confirm you're not a bot" :
// des cookies YouTube d'un vrai compte, passés via la variable d'environnement
// YT_COOKIES (contenu d'un cookies.txt au format Netscape). Le fichier est
// matérialisé dans /tmp puis passé avec "--cookies".
let cookieFile: string | null = null;
async function youTubeArgs(): Promise<string[]> {
  const args = [...YT_EXTRACTOR_ARGS];
  const cookies = process.env.YT_COOKIES;
  if (cookies) {
    if (!cookieFile) {
      cookieFile = path.join(os.tmpdir(), "vidversal-cookies.txt");
      await fs.writeFile(cookieFile, cookies, "utf8");
    }
    args.push("--cookies", cookieFile);
  }
  return args;
}

export interface DownloadOptions {
  formatId?: string;
  audioOnly?: boolean;
  audioFormat?: "mp3" | "flac" | "wav" | "aac" | "opus";
  videoFormat?: "mp4" | "webm" | "mkv" | "mov" | "avi";
  gif?: boolean;
  lang?: string;
  embedSubtitles?: boolean;
  subtitleOnly?: boolean;
}

export interface SubtitleTrack {
  lang: string;
  ext: string;
  url: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  duration: number;
}

export interface BatchResult {
  okay: boolean;
  filename?: string;
  error?: string;
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be"))
    return "YouTube";
  if (u.includes("tiktok.com")) return "TikTok";
  if (u.includes("instagram.com") || u.includes("instagr.am")) return "Instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "X/Twitter";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "Facebook";
  if (u.includes("twitch.tv")) return "Twitch";
  if (u.includes("dailymotion.com")) return "Dailymotion";
  if (u.includes("reddit.com")) return "Reddit";
  if (u.includes("vimeo.com")) return "Vimeo";
  if (u.includes("spankbang.com")) return "Autre";
  return "Autre";
}

export function isPlaylistUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    (u.includes("youtube.com") && /list=|playlist/.test(u)) ||
    u.includes("playlist") ||
    u.includes("set/") ||
    u.includes("collection")
  );
}

export function isShortUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    (u.includes("youtube.com") || u.includes("youtu.be")) &&
    /shorts/.test(u)
  );
}

export function isReelUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    (u.includes("instagram.com") && /reels?\//.test(u)) ||
    (u.includes("facebook.com") && /reel/.test(u)) ||
    (u.includes("tiktok.com") && /video|slide/.test(u))
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min${s.toString().padStart(2, "0")}`;
}

function pickThumbnail(thumbnails: unknown): string {
  if (Array.isArray(thumbnails) && thumbnails.length) {
    const arr = thumbnails as { url?: string; resolution?: string; width?: number }[];
    const best = [...arr].sort(
      (a, b) => (b.width || 0) - (a.width || 0)
    )[0];
    if (best?.url) return best.url;
  }
  return "";
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const args = [
    "--dump-json",
    "--no-playlist",
    "--no-warnings",
    ...(await youTubeArgs()),
  ];

  if (isPlaylistUrl(url)) {
    args.push("--flat-playlist");
  }

  const { stdout } = await execFileAsync("yt-dlp", [...args, url], {
    timeout: 30000,
  });

  const data = JSON.parse(stdout);

  // Flat playlist: chaque entrée est une vidéo de la playlist
  if (data._type === "playlist" && Array.isArray(data.entries)) {
    const items: PlaylistItem[] = data.entries
      .filter((e: Record<string, unknown>) => e && e.id)
      .map((e: Record<string, unknown>) => ({
        id: String(e.id),
        title: String(e.title || "Sans titre"),
        url: String(e.url || `https://www.youtube.com/watch?v=${e.id}`),
        duration: Number(e.duration || 0),
      }));

    return {
      id: String(data.id || "playlist"),
      title: String(data.title || "Playlist"),
      thumbnail: pickThumbnail(data.thumbnails),
      duration: 0,
      uploader: String(data.uploader || data.channel || ""),
      webpageUrl: url,
      formats: [],
      subtitles: [],
      platform: detectPlatform(url),
      playlist: true,
      playlistItems: items,
    };
  }

  const formats: VideoFormat[] = (data.formats || [])
    .filter(
      (f: Record<string, unknown>) =>
        f.vcodec !== "none" || f.acodec !== "none"
    )
    .map((f: Record<string, unknown>) => ({
      formatId: String(f.format_id || ""),
      ext: String(f.ext || "mp4"),
      height: typeof f.height === "number" ? f.height : null,
      width: typeof f.width === "number" ? f.width : null,
      fps: typeof f.fps === "number" ? f.fps : null,
      vcodec: String(f.vcodec || "none"),
      acodec: String(f.acodec || "none"),
      filesize:
        typeof f.filesize === "number"
          ? f.filesize
          : typeof f.filesize_approx === "number"
            ? f.filesize_approx
            : null,
      tbr: typeof f.tbr === "number" ? f.tbr : null,
      formatNote: String(f.format_note || ""),
      qualityLabel: String(
        f.format_note || f.height ? `${f.height}p` : "audio"
      ),
      hasAudio: f.acodec !== "none" && f.acodec !== null,
      hasVideo: f.vcodec !== "none" && f.vcodec !== null,
    }));

  const subtitles: SubtitleTrack[] = [];
  for (const [lang, arr] of Object.entries(data.subtitles || {})) {
    if (Array.isArray(arr)) {
      const best = (arr as { url?: string; ext?: string }[]).find(
        (s) => s.url
      );
      if (best?.url) {
        subtitles.push({
          lang,
          ext: String(best.ext || "vtt"),
          url: best.url,
        });
      }
    }
  }

  return {
    id: String(data.id || ""),
    title: String(data.title || "Sans titre"),
    thumbnail: pickThumbnail(data.thumbnails) || String(data.thumbnail || ""),
    duration: Number(data.duration || 0),
    uploader: String(data.uploader || data.channel || "Inconnu"),
    webpageUrl: String(data.webpage_url || url),
    formats,
    subtitles,
    platform: detectPlatform(url),
    isShort: isShortUrl(url),
    isReel: isReelUrl(url),
    playback: data.playback ? `${formatDuration(Number(data.duration || 0))}` : undefined,
  };
}

function buildBaseArgs(options: DownloadOptions): string[] {
  const args: string[] = [];
  const fmt = options.formatId
    ? `${options.formatId}+bestaudio/best`
    : "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
  args.push("-f", fmt);

  if (options.embedSubtitles) {
    args.push(
      "--write-sub",
      "--write-auto-sub",
      "--embed-subs",
      "--sub-langs",
      options.lang || "all"
    );
  }

  return args;
}

export async function downloadVideo(
  url: string,
  options: DownloadOptions = {}
): Promise<{ filePath: string; filename: string }> {
  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });

  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (options.subtitleOnly) {
    return downloadSubtitles(url, options.lang || "all");
  }

  if (options.gif) {
    const gifPath = path.join(DOWNLOAD_DIR, `${uniqueId}.gif`);
    await execFileAsync(
      "yt-dlp",
      [
        "--no-playlist",
        "--no-warnings",
        "-f", "best[height<=480]/best",
        "-o", gifPath,
        "--convert-formats", options.videoFormat || "gif",
        ...(await youTubeArgs()),
        url,
      ],
      { timeout: 120000 }
    );
    const files = await fs.readdir(DOWNLOAD_DIR);
    const gifFile = files.find((f) => f.startsWith(uniqueId) && f.endsWith(".gif"));
    if (!gifFile) throw new Error("GIF non trouvé après conversion");
    return { filePath: path.join(DOWNLOAD_DIR, gifFile), filename: gifFile };
  }

  if (options.audioOnly) {
    const audioExt = options.audioFormat || "mp3";
    const outputPath = path.join(DOWNLOAD_DIR, `${uniqueId}.${audioExt}`);
    const args = [
      "-x",
      "--audio-format", audioExt,
      "--audio-quality", "0",
      "-o", outputPath,
      "--no-playlist",
      "--no-warnings",
      ...(await youTubeArgs()),
      url,
    ];
    await execFileAsync("yt-dlp", args, { timeout: 120000 });
    const files = await fs.readdir(DOWNLOAD_DIR);
    const audioFile = files.find(
      (f) => f.startsWith(uniqueId) && f.endsWith(`.${audioExt}`)
    );
    if (!audioFile)
      throw new Error(`Fichier audio .${audioExt} non trouvé`);
    return {
      filePath: path.join(DOWNLOAD_DIR, audioFile),
      filename: audioFile,
    };
  }

  const outputBase = path.join(DOWNLOAD_DIR, `${uniqueId}.%(ext)s`);
  const args = [
    "--no-playlist",
    "--no-warnings",
    ...buildBaseArgs(options),
    "--merge-output-format",
    options.videoFormat || "mp4",
    "-o", outputBase,
    ...(options.videoFormat && options.videoFormat !== "mp4"
      ? ["--recode-video", options.videoFormat]
      : []),
    ...(options.embedSubtitles
      ? ["--write-sub", "--write-auto-sub", "--embed-subs", "--sub-langs", options.lang || "all"]
      : []),
    ...(await youTubeArgs()),
    url,
  ];

  await execFileAsync("yt-dlp", args, { timeout: 300000 });

  const files = await fs.readdir(DOWNLOAD_DIR);
  const videoFile = files.find((f) => f.startsWith(uniqueId));
  if (!videoFile)
    throw new Error("Fichier vidéo non trouvé après téléchargement");
  return {
    filePath: path.join(DOWNLOAD_DIR, videoFile),
    filename: videoFile,
  };
}

export async function downloadSubtitles(
  url: string,
  lang: string
): Promise<{ filePath: string; filename: string }> {
  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const outputBase = path.join(DOWNLOAD_DIR, `${uniqueId}.%(ext)s`);

  await execFileAsync(
    "yt-dlp",
    [
      "--skip-download",
      "--write-subs",
      "--write-auto-sub",
      "--sub-langs", lang,
      "--sub-format", "srt/vtt/best",
      "-o", outputBase,
      "--no-warnings",
      ...(await youTubeArgs()),
      url,
    ],
    { timeout: 60000 }
  );

  const files = await fs.readdir(DOWNLOAD_DIR);
  const subFile = files.find(
    (f) => f.startsWith(uniqueId) && (f.endsWith(".srt") || f.endsWith(".vtt"))
  );
  if (!subFile) throw new Error(`Sous-titres "${lang}" introuvables`);
  return { filePath: path.join(DOWNLOAD_DIR, subFile), filename: subFile };
}