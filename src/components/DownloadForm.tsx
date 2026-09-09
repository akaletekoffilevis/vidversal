"use client";

import { useEffect, useState } from "react";
import { Search, Link2, Loader2, Clock3, Megaphone } from "lucide-react";
import type { VideoInfo } from "@/lib/types";
import { VideoPreview } from "./VideoPreview";
import { apiUrl } from "@/lib/config";
import { getSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { useI18n } from "@/lib/i18n";

export function DownloadForm() {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Paramètres pilotés par l'admin (localStorage), avec repli sur les variables d'env.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    const apply = () => setSettings(getSettings());
    apply();
    window.addEventListener("vidversal-settings-changed", apply);
    return () => window.removeEventListener("vidversal-settings-changed", apply);
  }, []);

  const downloadEnabled =
    settings.downloadEnabled || process.env.NEXT_PUBLIC_ENABLE_DOWNLOAD !== "false";

  const workerUrl =
    settings.publicWorkerUrl ||
    process.env.NEXT_PUBLIC_DOWNLOAD_API_URL?.replace(/\/$/, "") ||
    "";

  const resolveUrl = (path: string) =>
    workerUrl ? `${workerUrl}${path}` : `/api${path}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const res = await fetch(resolveUrl("/info"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("download.errorDefault"));
      setVideoInfo(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("download.errorDefault"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {settings.bannerText && (
        <div className="mb-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-accent border border-border text-accent-foreground text-sm font-medium">
          <Megaphone className="w-4 h-4 shrink-0" />
          {settings.bannerText}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex items-center bg-card border border-border rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200">
          <Link2 className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("download.placeholder")}
            className="flex-1 min-w-0 ml-3 bg-transparent outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={loading || !url.trim() || !downloadEnabled}
            aria-label={t("download.analyze")}
            className="ml-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-600 hover:bg-brand-700 disabled:bg-muted flex items-center justify-center transition-colors shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-primary-foreground" />
            )}
          </button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {t("download.platforms")}
      </p>

      {!downloadEnabled && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm">
          <Clock3 className="w-4 h-4" />
          {t("download.soonAvailable")}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {videoInfo && <VideoPreview data={videoInfo} workerUrl={workerUrl} />}
    </section>
  );
}