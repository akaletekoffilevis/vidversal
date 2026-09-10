"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  User,
  Crown,
  Download,
  Heart,
  Trash2,
  Loader2,
  Check,
  ShieldCheck,
  AlertTriangle,
  History,
  LogOut,
  Save,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TierLimits } from "@/lib/types";
import type { PublicPlans } from "@/lib/usePlan";

interface MeResponse {
  id: string;
  name: string | null;
  email: string;
  role: string;
  tier: "free" | "pro";
  banned: boolean;
  emailVerified: boolean;
  avatar_emoji: string | null;
  lang: string | null;
  theme: string | null;
  createdAt: string | null;
  usageToday: number;
  plans: PublicPlans | null;
  limits: TierLimits | null;
}

interface HistoryItem {
  id: number;
  url: string;
  title: string | null;
  platform: string | null;
  format: string | null;
  quality: string | null;
  size_bytes: number | null;
  created_at: string;
}

interface FavoriteItem {
  id: number;
  url: string;
  title: string | null;
  platform: string | null;
  created_at: string;
}

export default function AccountPage() {
  const { t, locale, setLocale } = useI18n();
  const { status } = useSession();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire profil
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [lang, setLang] = useState("fr");
  const [theme, setTheme] = useState("system");
  const [profileMsg, setProfileMsg] = useState<"ok" | "err" | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Favoris
  const [favUrl, setFavUrl] = useState("");
  const [favMsg, setFavMsg] = useState<"ok" | "err" | null>(null);

  // Suppression
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const load = useCallback(async () => {
    const [meRes, histRes, favRes] = await Promise.all([
      fetch("/api/me"),
      fetch("/api/me/downloads"),
      fetch("/api/me/favorites"),
    ]);
    const m: MeResponse | null = meRes.ok ? await meRes.json() : null;
    setMe(m);
    if (m) {
      setName(m.name ?? m.email.split("@")[0]);
      setAvatar(m.avatar_emoji ?? "");
      setLang(m.lang ?? locale);
      setTheme(m.theme ?? "system");
    }
    setHistory(histRes.ok ? (await histRes.json()).items : []);
    setFavorites(favRes.ok ? (await favRes.json()).items : []);
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    load();
  }, [status, load]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (status !== "authenticated" || !me) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center pt-28 text-center px-4">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("account.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("account.signedOut")}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
            >
              {t("account.goToLogin")}
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted"
            >
              {t("account.goToSignup")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const daily = me.limits?.dailyDownloads ?? 0;
  const used = me.usageToday ?? 0;
  const quotaPct =
    daily > 0 ? Math.min(100, Math.round((used / daily) * 100)) : 0;
  const dailyLabel = daily <= 0 ? t("account.quotaUnlimited") : `${used}/${daily}`;

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar_emoji: avatar,
          lang,
          theme,
        }),
      });
      if (!res.ok) throw new Error();
      setProfileMsg("ok");
      if (lang !== locale) setLocale(lang as "fr" | "en");
      const resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.style.colorScheme = resolved;
      localStorage.setItem("vidversal-theme", resolved);
      load();
    } catch {
      setProfileMsg("err");
    } finally {
      setSavingProfile(false);
    }
  };

  const addFavorite = async () => {
    if (!favUrl.trim()) return;
    setFavMsg(null);
    try {
      const url = favUrl.trim().startsWith("http") ? favUrl.trim() : `https://${favUrl.trim()}`;
      const res = await fetch("/api/me/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error();
      setFavUrl("");
      setFavMsg("ok");
      load();
    } catch {
      setFavMsg("err");
    }
  };

  const removeFav = async (url: string) => {
    await fetch("/api/me/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    load();
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await fetch("/api/me", { method: "DELETE" });
      setDeleted(true);
      await signOut({ redirect: false });
      router.push("/");
    } finally {
      setDeleting(false);
    }
  };

  const fmtSize = (b: number | null) => {
    if (!b) return "—";
    const mb = b / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.round(b / 1024)} Ko`;
  };
  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const limits = me.limits;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 pt-28 sm:pt-32 pb-16 max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <span className="text-3xl">{me.avatar_emoji ?? "👤"}</span> {me.name || "—"}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                me.tier === "pro"
                  ? "bg-warning/20 text-warning"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {me.tier === "pro" ? (
                <>
                  <Crown className="w-3 h-3" /> {t("account.planPro")}
                </>
              ) : (
                t("account.planFree")
              )}
            </span>
          </h1>
          {me.emailVerified ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> {t("account.badgeVerified")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-warning font-medium">
              <AlertTriangle className="w-4 h-4" /> {t("account.badgeUnverified")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Profil */}
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              {t("account.sectionProfile")}
            </h2>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-muted-foreground">
                  {t("account.nameLabel")}
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </label>
                <label className="block text-xs font-medium text-muted-foreground">
                  {t("account.avatarLabel")}
                  <input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder={t("account.avatarPlaceholder")}
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-muted-foreground">
                  {t("account.langLabel")}
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-muted-foreground">
                  {t("account.themeLabel")}
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none"
                  >
                    <option value="system">{t("account.themeSystem")}</option>
                    <option value="light">{t("account.themeLight")}</option>
                    <option value="dark">{t("account.themeDark")}</option>
                  </select>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
                >
                  {savingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t("account.save")}
                </button>
                {profileMsg === "ok" && (
                  <span className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t("account.profileSaved")}
                  </span>
                )}
                {profileMsg === "err" && (
                  <span className="text-xs text-destructive">{t("account.profileSaveFailed")}</span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {me.createdAt
                    ? `${t("account.memberSince")} ${fmtDate(me.createdAt)}`
                    : ""}
                </span>
              </div>
            </div>
          </section>

          {/* Plan */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-warning" />
              {t("account.sectionPlan")}
            </h2>
            <div
              className={`rounded-xl p-4 mb-4 ${
                me.tier === "pro"
                  ? "bg-warning/10 border border-warning/30"
                  : "bg-muted"
              }`}
            >
              <p className="font-semibold text-sm">
                {me.tier === "pro" ? t("account.planPro") : t("account.planFree")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {me.tier === "pro" ? t("account.planDescPro") : t("account.planDescFree")}
              </p>
              {me.tier !== "pro" && (
                <button
                  onClick={() => router.push("/pricing")}
                  className="mt-3 w-full py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
                >
                  {t("account.upgrade")}
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-1.5 flex justify-between">
              <span>{t("account.quotaLabel")}</span>
              <span>{dailyLabel}</span>
            </p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quotaPct >= 100 ? "bg-destructive" : "bg-brand-600"
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            {daily > 0 && used >= daily && (
              <p className="text-xs text-destructive mt-2">{t("account.quotaReached")}</p>
            )}

            {limits && (
              <div className="mt-4 text-xs text-muted-foreground space-y-1.5">
                <p className="font-medium text-foreground">
                  {t("account.planLimitsTitle", {
                    plan: me.tier === "pro" ? t("account.planPro") : t("account.planFree"),
                  })}
                </p>
                <p>{t("account.maxQuality")} : {limits.maxQuality}p</p>
                <p>
                  {t("account.dailyDownloads")} :{" "}
                  {limits.dailyDownloads <= 0 ? t("account.quotaUnlimited") : limits.dailyDownloads}
                </p>
                <p>{t("account.maxFileSize")} : {limits.maxFileSizeMB} Mo</p>
                <p className="break-words">
                  {t("account.formats")} :
                  {" "}
                  {[...limits.audioFormats, ...limits.videoFormats].join(", ")}
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Historique */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              {t("account.sectionHistory")}
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("account.historyEmpty")}</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {history.map((h) => (
                  <li key={h.id} className="flex items-start gap-2.5 text-sm">
                    <Download className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{h.title || h.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.format} {h.quality ? `· ${h.quality}` : ""} · {fmtSize(h.size_bytes)}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {fmtDate(h.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="mt-3 text-xs text-destructive hover:underline"
              >
                {t("account.clearHistory")}
              </button>
            )}
          </section>

          {/* Favoris */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              {t("account.sectionFavorites")}
            </h2>
            <div className="flex gap-2 mb-3">
              <input
                value={favUrl}
                onChange={(e) => setFavUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFavorite()}
                placeholder={t("account.favoritesUrlPlaceholder")}
                className="flex-1 min-w-0 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                onClick={addFavorite}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
              >
                {t("account.favoritesAddBtn")}
              </button>
            </div>
            {favMsg === "ok" && (
              <p className="text-xs text-brand-600 dark:text-brand-400 mb-2">{t("account.ok")}</p>
            )}
            {favMsg === "err" && (
              <p className="text-xs text-destructive mb-2">{t("account.profileSaveFailed")}</p>
            )}
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("account.favoritesEmpty")}</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {favorites.map((f) => (
                  <li key={f.id} className="flex items-center gap-2.5 text-sm">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate hover:underline"
                    >
                      {f.title || f.url}
                    </a>
                    <button
                      onClick={() => removeFav(f.url)}
                      className="text-xs text-destructive hover:underline shrink-0"
                    >
                      {t("account.removeFavorite")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Danger */}
        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
          <h2 className="font-semibold mb-2 text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {t("account.sectionDanger")}
          </h2>
          {!confirmDelete ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">{t("account.deleteConfirmDesc")}</p>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> {t("account.deleteAccount")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={doDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 flex items-center gap-2 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {t("account.deleteConfirmBtn")}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
              >
                {t("account.deleteCancel")}
              </button>
              {deleted && <span className="text-xs text-destructive">{t("account.deleteDone")}</span>}
            </div>
          )}
        </section>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted"
          >
            <LogOut className="w-4 h-4" /> {t("admin.dashboard.logout")}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}