"use client";

import { useState } from "react";
import { Search, Link2, Loader2, Clock3 } from "lucide-react";
import type { VideoInfo } from "@/lib/types";
import { VideoPreview } from "./VideoPreview";
import { apiUrl, DOWNLOAD_ENABLED } from "@/lib/config";

export function DownloadForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const res = await fetch(apiUrl("/info"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setVideoInfo(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex items-center bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-full px-5 py-3 shadow-sm focus-within:border-brand-500 focus-within:shadow-brand-500/10 focus-within:shadow-lg transition-all duration-200">
          <Link2 className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Collez le lien de la vidéo ici..."
            className="flex-1 ml-3 bg-transparent outline-none text-base text-foreground placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading || !url.trim() || !DOWNLOAD_ENABLED}
            className="ml-3 w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 flex items-center justify-center transition-colors shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        YouTube · TikTok · Instagram · X/Twitter · Facebook · Twitch · Dailymotion · Vimeo · Reddit
      </p>

      {!DOWNLOAD_ENABLED && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
          <Clock3 className="w-4 h-4" />
          Le téléchargement arrive bientôt — le site est en ligne en avant-première.
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {videoInfo && <VideoInfo data={videoInfo} />}

      <div id="features" />
    </section>
  );
}

function VideoInfo({ data }: { data: VideoInfo }) {
  return <VideoPreview data={data} />;
}