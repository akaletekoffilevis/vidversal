export interface SubtitleTrack {
  lang: string;
  ext: string;
  url: string;
}

export interface VideoFormat {
  formatId: string;
  ext: string;
  height: number | null;
  width: number | null;
  fps: number | null;
  vcodec: string;
  acodec: string;
  filesize: number | null;
  tbr: number | null;
  formatNote: string;
  qualityLabel: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  duration: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  webpageUrl: string;
  formats: VideoFormat[];
  subtitles: SubtitleTrack[];
  platform: string;
  isShort?: boolean;
  isReel?: boolean;
  playback?: string;
  playlist?: boolean;
  playlistItems?: PlaylistItem[];
}

export interface DownloadRequest {
  url: string;
  formatId?: string;
  audioOnly?: boolean;
  audioFormat?: "mp3" | "flac" | "wav" | "aac" | "opus";
  videoFormat?: "mp4" | "webm" | "mkv" | "mov" | "avi";
  gif?: boolean;
  lang?: string;
  embedSubtitles?: boolean;
  quality?: string;
}

export interface DownloadResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

export interface BatchRequest {
  urls: string[];
  quality?: string;
  audioOnly?: boolean;
}

export interface BatchResponse {
  success: boolean;
  total: number;
  results: {
    url: string;
    filename?: string;
    ok: boolean;
    error?: string;
  }[];
}

export type Tier = "free" | "pro";

export interface TierLimits {
  maxQuality: number; // hauteur max en px
  maxDurationSec: number;
  batchSize: number;
  audioFormats: ("mp3" | "flac" | "wav" | "aac" | "opus")[];
  videoFormats: ("mp4" | "webm" | "mkv" | "mov" | "avi")[];
  gif: boolean;
  subtitles: boolean;
  playlist: boolean;
  dailyDownloads: number;
  maxFileSizeMB: number;
  parallelDownloads: number;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxQuality: 1080,
    maxDurationSec: 900,
    batchSize: 1,
    audioFormats: ["mp3"],
    videoFormats: ["mp4"],
    gif: false,
    subtitles: false,
    playlist: false,
    dailyDownloads: 10,
    maxFileSizeMB: 512,
    parallelDownloads: 1,
  },
  pro: {
    maxQuality: 8192,
    maxDurationSec: Infinity,
    batchSize: 50,
    audioFormats: ["mp3", "flac", "wav", "aac", "opus"],
    videoFormats: ["mp4", "webm", "mkv", "mov", "avi"],
    gif: true,
    subtitles: true,
    playlist: true,
    dailyDownloads: Infinity,
    maxFileSizeMB: 8192,
    parallelDownloads: 3,
  },
};