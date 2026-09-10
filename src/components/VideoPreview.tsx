"use client";

import { useState, useMemo } from "react";
import {
  Play,
  Clock,
  User,
  Download,
  Loader2,
  Lock,
  Music,
  Captions,
  Film,
  Image as ImageIcon,
  Heart,
} from "lucide-react";
import type { VideoInfo } from "@/lib/types";
import { apiUrl } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { usePlan } from "@/lib/usePlan";

const AUDIO_FORMATS = [
  { id: "mp3", label: "MP3", pro: false },
  { id: "aac", label: "AAC", pro: true },
  { id: "opus", label: "OPUS", pro: true },
  { id: "wav", label: "WAV", pro: true },
  { id: "flac", label: "FLAC", pro: true },
];

const VIDEO_FORMATS = [
  { id: "mp4", label: "MP4", pro: false },
  { id: "webm", label: "WebM", pro: true },
  { id: "mkv", label: "MKV", pro: true },
  { id: "mov", label: "MOV", pro: true },
  { id: "avi", label: "AVI", pro: true },
];

export function VideoPreview({
  data,
  workerUrl,
}: {
  data: VideoInfo;
  workerUrl?: string;
}) {
  const { t, locale } = useI18n();
  const { limits, isLoggedIn } = usePlan();
  const [showAllQualities, setShowAllQualities] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("mp4");
  const [audioOnly, setAudioOnly] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState("mp3");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [gif, setGif] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favState, setFavState] = useState<"idle" | "saving" | "saved" | "login">("idle");

  const videoFormats = useMemo(
    () =>
      data.formats.filter(
        (f): f is typeof f & { height: number } =>
          f.hasVideo && f.height !== null
      ),
    [data.formats]
  );
  const uniqueHeights = useMemo(
    () =>
      [...new Set(videoFormats.map((f) => f.height))].sort((a, b) => b - a),
    [videoFormats]
  );

  const min = Math.floor(data.duration / 60);
  const sec = data.duration % 60;
  const displayHeights = showAllQualities
    ? uniqueHeights
    : uniqueHeights.slice(0, 4);

  const resolveUrl = (path: string) =>
    workerUrl ? `${workerUrl}${path}` : apiUrl(path);

  const startDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      if (workerUrl && isLoggedIn) {
        const me = await fetch("/api/me").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const daily = me?.limits?.dailyDownloads ?? limits.dailyDownloads;
        const used = me?.usageToday ?? 0;
        if (daily > 0 && used >= daily) {
          setError(t("download.quotaExceeded"));
          return;
        }
      }
      const params = new URLSearchParams({ url: data.webpageUrl });
      if (audioOnly) {
        params.set("audioOnly", "true");
        params.set("audioFormat", selectedAudio);
      } else {
        if (selectedQuality) params.set("formatId", selectedQuality);
        params.set("videoFormat", selectedFormat);
        if (gif) params.set("gif", "true");
      }
      if (selectedLang) {
        params.set("lang", selectedLang);
        if (!audioOnly && !gif) params.set("embedSubtitles", "true");
      }

      const res = await fetch(resolveUrl(`/download?${params.toString()}`));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error || t("preview.networkError");
        setError(res.status === 402 ? t("preview.proRequired", { msg }) : msg);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : "vidversal-download";

      if (isLoggedIn) {
        fetch("/api/me/downloads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: data.webpageUrl,
            title: data.title,
            platform: data.platform,
            format: audioOnly ? `audio:${selectedAudio}` : gif ? "gif" : `video:${selectedFormat}`,
            quality: selectedQuality || undefined,
            size_bytes: blob.size,
          }),
        }).catch(() => {});
      }

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("preview.networkError"));
    } finally {
      setDownloading(false);
    }
  };

  const ProBadge = ({ show }: { show?: boolean }) =>
    show ? (
      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
        <Lock className="w-2.5 h-2.5" /> PRO
      </span>
    ) : null;

  const saveFavorite = async () => {
    if (!isLoggedIn) {
      setFavState("login");
      return;
    }
    setFavState("saving");
    try {
      const res = await fetch("/api/me/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.webpageUrl,
          title: data.title,
          platform: data.platform,
        }),
      });
      setFavState(res.ok ? "saved" : "idle");
    } catch {
      setFavState("idle");
    }
  };

  const chipBase =
    "bg-muted border-border hover:border-brand-400 dark:hover:border-brand-600";
  const chipActive = "bg-brand-600 text-white border-brand-600 hover:border-brand-600";

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Miniature */}
        <div className="relative sm:w-64 shrink-0 aspect-video sm:aspect-auto bg-muted">
          {data.thumbnail && (
            <img
              src={data.thumbnail}
              alt={data.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded font-mono">
            <Clock className="w-3 h-3" />
            {min}:{sec.toString().padStart(2, "0")}
          </span>
          <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
            {data.platform}
          </span>
        </div>

        {/* Infos + options */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <h3 className="font-semibold text-sm leading-snug mb-0.5 line-clamp-2">
            {data.title}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <User className="w-3 h-3" /> {data.uploader}
          </p>

          {data.playlist && (
            <div className="mb-4 p-3 rounded-xl bg-accent border border-border text-xs">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-accent-foreground">
                <Play className="w-3 h-3" /> {t("preview.playlistDetected")}
              </p>
              <p className="text-muted-foreground">
                {t("preview.playlistCount", {
                  count: data.playlistItems?.length ?? 0,
                })}{" "}
                <ProBadge show={!limits.playlist} />
              </p>
            </div>
          )}

          {/* Tabs Vidéo / Audio */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-3">
            <button
              onClick={() => setAudioOnly(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                !audioOnly
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Film className="w-3.5 h-3.5" /> {t("preview.tabVideo")}
            </button>
            <button
              onClick={() => setAudioOnly(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                audioOnly
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Music className="w-3.5 h-3.5" /> {t("preview.tabAudio")}
            </button>
          </div>

          {!audioOnly ? (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("preview.quality")}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {displayHeights.map((h) => {
                  const fmt = videoFormats.find((f) => f.height === h);
                  const pro = h > limits.maxQuality;
                  const active = selectedQuality === fmt?.formatId;
                  return (
                    <button
                      key={h}
                      onClick={() =>
                        setSelectedQuality(
                          active ? null : fmt?.formatId || null
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        active ? chipActive : chipBase
                      }`}
                    >
                      {h}p{fmt?.fps && fmt.fps >= 60 ? ` ${fmt.fps}fps` : ""}
                      <ProBadge show={pro} />
                    </button>
                  );
                })}
                {uniqueHeights.length > 4 && (
                  <button
                    onClick={() => setShowAllQualities(!showAllQualities)}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline px-2"
                  >
                    {showAllQualities ? t("preview.less") : t("preview.more", { n: uniqueHeights.length - 4 })}
                  </button>
                )}
              </div>

              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Film className="w-3 h-3" /> {t("preview.format")}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {VIDEO_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                      selectedFormat === f.id ? chipActive : chipBase
                    }`}
                  >
                    {f.label}
                    <ProBadge show={!limits.videoFormats.includes(f.id as never)} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Music className="w-3 h-3" /> {t("preview.audioFormat")}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {AUDIO_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedAudio(f.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                      selectedAudio === f.id ? chipActive : chipBase
                    }`}
                  >
                    {f.label}
                    <ProBadge show={!limits.audioFormats.includes(f.id as never)} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Options bonus */}
          <div className="flex flex-wrap gap-2 mb-4">
            {!audioOnly && (
              <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={gif}
                  onChange={(e) => setGif(e.target.checked)}
                  className="accent-brand-600"
                />
                <ImageIcon className="w-3.5 h-3.5" /> {t("preview.gif")}{" "}
                <ProBadge show={!limits.gif} />
              </label>
            )}
            {data.subtitles.length > 0 && (
              <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground">
                <Captions className="w-3.5 h-3.5" /> {t("preview.subtitles")}
                <ProBadge show={!limits.subtitles} />
                <select
                  value={selectedLang || ""}
                  onChange={(e) => setSelectedLang(e.target.value || null)}
                  className="bg-transparent text-xs border border-border rounded px-1.5 py-0.5"
                >
                  <option value="">{t("preview.subtitleOff")}</option>
                  {data.subtitles.map((s) => (
                    <option key={s.lang} value={s.lang}>
                      {langName(s.lang, locale)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive mb-3">{error}</p>
          )}

          <button
            onClick={startDownload}
            disabled={downloading}
            className="mt-auto w-full sm:w-auto sm:self-start px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("preview.downloading")}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> {t("preview.download")}
              </>
            )}
          </button>

          <button
            onClick={saveFavorite}
            disabled={favState === "saving" || favState === "saved"}
            aria-label={t("preview.saveFavorite")}
            title={
              !isLoggedIn
                ? t("preview.goLoginForFav")
                : t("preview.saveFavorite")
            }
            className={`mt-3 sm:mt-0 sm:ml-3 sm:self-start px-4 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${
              favState === "saved"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-border text-muted-foreground hover:border-brand-400 hover:text-foreground"
            }`}
          >
            {favState === "saved" ? (
              <>✓ {t("preview.savedFavorite")}</>
            ) : favState === "saving" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("preview.saveFavorite")}
              </>
            ) : (
              <Heart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const LANG_CACHE = new Map<string, string>();

function langName(lang: string, displayLocale: "fr" | "en"): string {
  const cacheKey = `${displayLocale}:${lang}`;
  const cached = LANG_CACHE.get(cacheKey);
  if (cached) return cached;
  try {
    const name = new Intl.DisplayNames([displayLocale], { type: "language" }).of(lang);
    LANG_CACHE.set(cacheKey, name || lang);
    return name || lang;
  } catch {
    return lang;
  }
}