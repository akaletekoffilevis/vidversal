"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Settings,
  Download,
  DatabaseBackup,
  LogOut,
  Save,
  ExternalLink,
  Home,
  DownloadCloud,
  Users,
  Activity as ActivityIcon,
  ShieldCheck,
  Crown,
  Coins,
  Search,
  Plus,
  X,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  resetSettings,
  exportSettings,
} from "@/lib/settings";
import { useI18n } from "@/lib/i18n";
import type { Tier } from "@/lib/types";
import type { AudioFormat, VideoFormat } from "@/lib/plans";

type Tab = "general" | "users" | "activity" | "plans" | "backup";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  tier: Tier;
  banned: boolean;
  email_verified: boolean;
  avatar_emoji: string | null;
  provider: string | null;
  created_at: string | null;
}

interface UserStats {
  total: number;
  verified: number;
  pro: number;
  banned: number;
  admins: number;
  downloadsToday: number;
}

interface ActivityItem {
  id: number;
  actor: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

interface PlanPayload {
  free: Record<string, unknown>;
  pro: Record<string, unknown>;
  pricing: { monthlyPriceEur: number; yearlyPriceEur: number };
}

export function AdminDashboard() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    setSettings({ ...settings, ...patch });
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden sm:flex w-60 shrink-0 border-r border-border bg-card flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border">
          <p className="font-bold text-lg">
            <span className="text-brand-600 dark:text-brand-400">Vid</span>versal
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.dashboard.administration")}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <AdminNavItem
            icon={<Settings className="w-4 h-4" />}
            label={t("admin.dashboard.general")}
            active={tab === "general"}
            onClick={() => setTab("general")}
          />
          <AdminNavItem
            icon={<Users className="w-4 h-4" />}
            label={t("admin.dashboard.users")}
            active={tab === "users"}
            onClick={() => setTab("users")}
          />
          <AdminNavItem
            icon={<Coins className="w-4 h-4" />}
            label={t("admin.dashboard.plansTab")}
            active={tab === "plans"}
            onClick={() => setTab("plans")}
          />
          <AdminNavItem
            icon={<ActivityIcon className="w-4 h-4" />}
            label={t("admin.dashboard.activity")}
            active={tab === "activity"}
            onClick={() => setTab("activity")}
          />
          <AdminNavItem
            icon={<DatabaseBackup className="w-4 h-4" />}
            label={t("admin.dashboard.backup")}
            active={tab === "backup"}
            onClick={() => setTab("backup")}
          />
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" /> {t("admin.dashboard.viewSite")}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" /> {t("admin.dashboard.logout")}
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-20 border-b border-border bg-card flex items-center justify-between px-4 py-3">
        <p className="font-bold">
          <span className="text-brand-600 dark:text-brand-400">Vid</span>versal
          <span className="text-xs font-normal text-muted-foreground ml-2">
            {t("admin.dashboard.administration")}
          </span>
        </p>
        <div className="flex gap-2">
          <Link
            href="/"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label={t("admin.dashboard.viewSite")}
          >
            <Home className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label={t("admin.dashboard.logout")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 px-4 sm:px-8 pt-20 sm:pt-0 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Mobile tabs */}
          <div className="sm:hidden flex gap-1 pt-4 pb-4 overflow-x-auto">
            <MobileTab label={t("admin.dashboard.general")} active={tab === "general"} onClick={() => setTab("general")} />
            <MobileTab label={t("admin.dashboard.users")} active={tab === "users"} onClick={() => setTab("users")} />
            <MobileTab label={t("admin.dashboard.plansTab")} active={tab === "plans"} onClick={() => setTab("plans")} />
            <MobileTab label={t("admin.dashboard.activity")} active={tab === "activity"} onClick={() => setTab("activity")} />
            <MobileTab label={t("admin.dashboard.backup")} active={tab === "backup"} onClick={() => setTab("backup")} />
          </div>

          <div className="sm:pt-10">
            {tab === "general" && <GeneralTab settings={settings} update={update} />}
            {tab === "users" && <UsersTab />}
            {tab === "plans" && <PlansTab />}
            {tab === "activity" && <ActivityTab />}
            {tab === "backup" && <BackupTab />}
          </div>

          {/* Save bar (mobile) */}
          {(tab === "general" || tab === "backup") && (
            <div className="sm:hidden sticky bottom-0 inset-x-0 bg-card border-t border-border p-3 mt-6 flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <Save className="w-4 h-4" /> {t("admin.dashboard.save")}
              </button>
              {saved && <span className="text-xs text-success shrink-0">{t("admin.dashboard.saved")}</span>}
            </div>
          )}
        </div>
      </main>

      {/* Desktop save button */}
      {(tab === "general" || tab === "backup") && (
        <button
          onClick={handleSave}
          className="sm:flex hidden fixed bottom-6 right-6 items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:opacity-90 transition-all"
        >
          <Save className="w-4 h-4" /> {t("admin.dashboard.saveChanges")}
        </button>
      )}
      {saved && (
        <span className="hidden sm:block fixed bottom-6 left-64 text-sm text-success bg-success/10 border border-success/30 rounded-full px-4 py-2 z-50">
          {t("admin.dashboard.savedChanges")}
        </span>
      )}
    </div>
  );
}

function AdminNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 text-sm rounded-full transition-colors ${
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6">
      {title && <h2 className="font-semibold text-foreground">{title}</h2>}
      {description && (
        <p className="text-xs text-muted-foreground mt-1 mb-4">{description}</p>
      )}
      {!description && <div className={title ? "mb-4" : ""} />}
      {children}
    </div>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function NumberInput({
  value,
  suffix,
  onChange,
}: {
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="relative w-full max-w-[140px]">
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full pl-3 pr-10 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

function GeneralTab({
  settings,
  update,
}: {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState<{
    loading: boolean;
    ok?: boolean;
    url?: string;
    detail?: string;
    latency?: number;
  }>({ loading: false });

  const checkWorker = async () => {
    setStatus({ loading: true });
    try {
      const res = await fetch("/api/admin/worker-status");
      if (!res.ok) {
        setStatus({ loading: false, ok: false, detail: "HTTP " + res.status });
        return;
      }
      const data = await res.json();
      setStatus({
        loading: false,
        ok: Boolean(data.ok),
        url: data.url,
        detail: data.detail,
        latency: data.latencyMs,
      });
    } catch {
      setStatus({ loading: false, ok: false });
    }
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400" /> {t("admin.dashboard.general")}
      </h1>

      <SectionCard
        title={t("admin.dashboard.downloads")}
        description={t("admin.dashboard.downloadsDesc")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-muted-foreground" />
              {t("admin.dashboard.downloadEnabled")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("admin.dashboard.downloadDisabledHint")}
            </p>
          </div>
          <Switch
            checked={settings.downloadEnabled}
            onChange={(v) => update({ downloadEnabled: v })}
          />
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium mb-1.5 block">{t("admin.dashboard.workerUrl")}</label>
          <input
            type="text"
            value={settings.publicWorkerUrl}
            onChange={(e) => update({ publicWorkerUrl: e.target.value })}
            placeholder={t("admin.dashboard.workerUrlPlaceholder")}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {t("admin.dashboard.workerUrlHint")}
          </p>
        </div>
      </SectionCard>

      <SectionCard title={t("admin.dashboard.workerStatus")}>
        <div className="flex items-center gap-3">
          <button
            onClick={checkWorker}
            disabled={status.loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {status.loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <DownloadCloud className="w-4 h-4" />
            )}
            {t("admin.dashboard.workerCheck")}
          </button>
          {status.loading && (
            <span className="text-xs text-muted-foreground">{t("admin.dashboard.workerChecking")}</span>
          )}
          {!status.loading && status.ok !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
                status.ok
                  ? "bg-success/15 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.ok ? "bg-success" : "bg-destructive"}`} />
              {status.ok ? t("admin.dashboard.workerOnline") : t("admin.dashboard.workerOffline")}
              {status.latency !== undefined && ` · ${status.latency}ms`}
            </span>
          )}
        </div>
        {status.url && (
          <p className="text-xs text-muted-foreground mt-3 break-all">
            {t("admin.dashboard.workerUrlColo")} : <span className="font-mono">{status.url}</span>
            {status.detail && ` — ${status.detail}`}
          </p>
        )}
        {!status.url && status.ok === undefined && (
          <p className="text-xs text-muted-foreground mt-2">{t("admin.dashboard.workerNone")}</p>
        )}
      </SectionCard>

      <SectionCard
        title={t("admin.dashboard.bannerTitle")}
        description={t("admin.dashboard.bannerDesc")}
      >
        <input
          type="text"
          value={settings.bannerText}
          onChange={(e) => update({ bannerText: e.target.value })}
          placeholder={t("admin.dashboard.bannerPlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </SectionCard>
    </>
  );
}

/* ------------------------------ Utilisateurs ------------------------------ */

function UsersTab() {
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (payload: Record<string, unknown>, okMsg: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
      setMessage(okMsg);
    } else {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || t("admin.dashboard.profileSaveFailed"));
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const filtered = users.filter(
    (u) =>
      !query ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      (u.name || "").toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">…</div>;
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" /> {t("admin.dashboard.users")}
      </h1>

      {stats && (
        <SectionCard title={t("admin.dashboard.statsTitle")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat label={t("admin.dashboard.statsTotal")} value={stats.total} />
            <Stat label={t("admin.dashboard.statsVerified")} value={stats.verified} />
            <Stat label={t("admin.dashboard.statsPro")} value={stats.pro} />
            <Stat label={t("admin.dashboard.statsBanned")} value={stats.banned} />
            <Stat label={t("admin.dashboard.statsAdmins")} value={stats.admins} />
            <Stat label={t("admin.dashboard.statsDownloadsToday")} value={stats.downloadsToday} />
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.dashboard.userSearch")}
              className="w-full pl-9 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> {t("admin.dashboard.createUser")}
          </button>
        </div>

        {message && <p className="text-xs text-success mb-3">{message}</p>}

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t("admin.dashboard.noUsers")}</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate flex items-center gap-2">
                    {u.avatar_emoji ?? "👤"} {u.name || u.email}
                    {u.role === "admin" && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-600/15 text-brand-600 dark:text-brand-400 font-medium">
                        <ShieldCheck className="w-2.5 h-2.5" /> {t("admin.dashboard.usersForm.adminRole")}
                      </span>
                    )}
                    {u.tier === "pro" && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                        <Crown className="w-2.5 h-2.5" /> PRO
                      </span>
                    )}
                    {u.banned && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
                        <AlertTriangle className="w-2.5 h-2.5" /> {t("admin.dashboard.bannedBadge")}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email} · {u.provider ?? "—"}
                    {u.email_verified ? ` · ✓ ${t("admin.dashboard.usersForm.userRole")}` : ""}
                    {u.created_at ? ` · ${new Date(u.created_at).toLocaleDateString()}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {u.tier !== "pro" ? (
                    <button
                      onClick={() => act({ id: u.id, tier: "pro" }, t("admin.dashboard.usersForm.setPro"))}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                    >
                      <Crown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => act({ id: u.id, tier: "free" }, t("admin.dashboard.usersForm.setFree"))}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {u.banned ? (
                    <button
                      onClick={() => act({ id: u.id, banned: false }, t("admin.dashboard.usersForm.unbanned"))}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                      title={t("admin.dashboard.unbanUser")}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => act({ id: u.id, banned: true }, t("admin.dashboard.usersForm.banned"))}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                      title={t("admin.dashboard.banUser")}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(u)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
                    title={t("admin.dashboard.editUserTitle")}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleting(u)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10"
                    title={t("admin.dashboard.deleteUser")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {creating && (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onDone={async () => {
            setCreating(false);
            await load();
          }}
          showMsg={setMessage}
        />
      )}
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onDone={async () => {
            setEditing(null);
            await load();
          }}
          showMsg={setMessage}
        />
      )}
      {deleting && (
        <DeleteConfirm
          user={deleting}
          onClose={() => setDeleting(null)}
          onDone={async () => {
            setDeleting(null);
            setMessage(t("admin.dashboard.usersForm.deleted"));
            setTimeout(() => setMessage(null), 2000);
            await load();
          }}
        />
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ModalFrame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateUserModal({
  onClose,
  onDone,
  showMsg,
}: {
  onClose: () => void;
  onDone: () => Promise<void>;
  showMsg: (m: string) => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", password: "", tier: "free", role: "user" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error || "Erreur");
        return;
      }
      const data = await res.json();
      showMsg(t("admin.dashboard.usersForm.created"));
      await onDone();
      void data;
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalFrame title={t("admin.dashboard.createUser")} onClose={onClose}>
      <div className="space-y-3">
        <Field label={t("admin.dashboard.usersForm.userName")}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label={t("admin.dashboard.usersForm.userEmail")}>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        </Field>
        <Field label={t("admin.dashboard.usersForm.userPassword")}>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("admin.dashboard.usersForm.tierPrompt")}>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={inputCls}>
              <option value="free">Free</option>
              <option value="pro">PRO</option>
            </select>
          </Field>
          <Field label={t("admin.dashboard.usersForm.rolePrompt")}>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
              <option value="user">{t("admin.dashboard.usersForm.userRole")}</option>
              <option value="admin">{t("admin.dashboard.usersForm.adminRole")}</option>
            </select>
          </Field>
        </div>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <button
          onClick={submit}
          disabled={busy || !form.email || form.password.length < 8}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {busy ? "…" : t("admin.dashboard.usersForm.createUserSubmit")}
        </button>
      </div>
    </ModalFrame>
  );
}

function EditUserModal({
  user,
  onClose,
  onDone,
  showMsg,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: () => Promise<void>;
  showMsg: (m: string) => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email,
    password: "",
    tier: user.tier,
    role: user.role,
    banned: user.banned,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: user.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error || "Erreur");
        return;
      }
      showMsg(t("admin.dashboard.usersForm.updated"));
      await onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalFrame title={t("admin.dashboard.editUserTitle")} onClose={onClose}>
      <div className="space-y-3">
        <Field label={t("admin.dashboard.usersForm.userName")}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label={t("admin.dashboard.usersForm.userEmail")}>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        </Field>
        <Field label={t("admin.dashboard.usersForm.userPassword")}>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t("admin.dashboard.usersForm.passwordTip")} className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t("admin.dashboard.usersForm.tierPrompt")}>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as Tier })} className={inputCls}>
              <option value="free">Free</option>
              <option value="pro">PRO</option>
            </select>
          </Field>
          <Field label={t("admin.dashboard.usersForm.rolePrompt")}>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
              <option value="user">{t("admin.dashboard.usersForm.userRole")}</option>
              <option value="admin">{t("admin.dashboard.usersForm.adminRole")}</option>
            </select>
          </Field>
          <Field label={t("admin.dashboard.usersForm.roleLabel")}>
            <select
              value={form.banned ? "1" : "0"}
              onChange={(e) => setForm({ ...form, banned: e.target.value === "1" })}
              className={inputCls}
            >
              <option value="0">{t("admin.dashboard.usersForm.userRole")}</option>
              <option value="1">{t("admin.dashboard.bannedBadge")}</option>
            </select>
          </Field>
        </div>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <button
          onClick={submit}
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {busy ? "…" : t("admin.dashboard.saveChangesAlt")}
        </button>
      </div>
    </ModalFrame>
  );
}

function DeleteConfirm({
  user,
  onClose,
  onDone,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    await onDone();
  };

  return (
    <ModalFrame title={t("admin.dashboard.deleteUserConfirm")} onClose={onClose}>
      <p className="text-sm text-muted-foreground mb-4 break-all">{user.email}</p>
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 py-2.5 rounded-lg bg-destructive text-white text-sm font-medium disabled:opacity-50"
        >
          {busy ? "…" : t("admin.dashboard.deleteUser")}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium">
          {t("admin.dashboard.close")}
        </button>
      </div>
    </ModalFrame>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

/* --------------------------------- Plans ---------------------------------- */

const AUDIO_FMT: AudioFormat[] = ["mp3", "flac", "wav", "aac", "opus"];
const VIDEO_FMT: VideoFormat[] = ["mp4", "webm", "mkv", "mov", "avi"];

function PlansTab() {
  const { t } = useI18n();
  const [form, setForm] = useState<PlanPayload | null>(null);
  const [msg, setMsg] = useState<"ok" | "err" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/plans")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            free: { ...data.free },
            pro: { ...data.pro },
            pricing: { ...data.pricing },
          });
        }
      })
      .catch(() => null);
  }, []);

  const patchLimits = (tier: "free" | "pro", patch: Record<string, unknown>) => {
    if (!form) return;
    const base = tier === "free" ? form.free : form.pro;
    setForm({ ...form, [tier]: { ...base, ...patch } });
  };

  const toggleFmt = (tier: "free" | "pro", field: "audioFormats" | "videoFormats", fmt: string) => {
    if (!form) return;
    const current = form[tier][field] as string[];
    const next = current.includes(fmt)
      ? current.filter((f) => f !== fmt)
      : [...current, fmt];
    if (!next.length) return;
    patchLimits(tier, { [field]: next });
  };

  const save = async () => {
    if (!form) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMsg(res.ok ? "ok" : "err");
    } catch {
      setMsg("err");
    } finally {
      setBusy(false);
    }
  };

  if (!form) {
    return <div className="text-center py-16 text-muted-foreground">…</div>;
  }

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <Coins className="w-6 h-6 text-brand-600 dark:text-brand-400" /> {t("admin.dashboard.plansTab")}
      </h1>

      <p className="text-xs text-muted-foreground mb-6 -mt-2">{t("admin.dashboard.plansForm.desc")}</p>

      {(["free", "pro"] as const).map((tier) => (
        <SectionCard
          key={tier}
          title={
            tier === "free"
              ? t("admin.dashboard.plansForm.freePlan")
              : t("admin.dashboard.plansForm.proPlan")
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.maxQuality")}</label>
              <NumberInput value={form[tier].maxQuality as number} suffix="p" onChange={(v) => patchLimits(tier, { maxQuality: v })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.dailyDownloads")}</label>
              <NumberInput value={form[tier].dailyDownloads as number} onChange={(v) => patchLimits(tier, { dailyDownloads: v })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.maxFileSize")}</label>
              <NumberInput value={form[tier].maxFileSizeMB as number} suffix="Mo" onChange={(v) => patchLimits(tier, { maxFileSizeMB: v })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.maxDuration")}</label>
              <NumberInput value={form[tier].maxDurationSec as number} suffix="s" onChange={(v) => patchLimits(tier, { maxDurationSec: v })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.batchSize")}</label>
              <NumberInput value={form[tier].batchSize as number} onChange={(v) => patchLimits(tier, { batchSize: v })} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.parallelDownloads")}</label>
              <NumberInput value={form[tier].parallelDownloads as number} onChange={(v) => patchLimits(tier, { parallelDownloads: v })} />
            </div>
          </div>

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t("admin.dashboard.plansForm.audioFormats")}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AUDIO_FMT.map((f) => (
              <Chip
                key={f}
                label={f.toUpperCase()}
                active={(form[tier].audioFormats as string[]).includes(f)}
                onClick={() => toggleFmt(tier, "audioFormats", f)}
              />
            ))}
          </div>

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t("admin.dashboard.plansForm.videoFormats")}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {VIDEO_FMT.map((f) => (
              <Chip
                key={f}
                label={f.toUpperCase()}
                active={(form[tier].videoFormats as string[]).includes(f)}
                onClick={() => toggleFmt(tier, "videoFormats", f)}
              />
            ))}
          </div>

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t("admin.dashboard.plansForm.features")}
          </p>
          <div className="flex items-center gap-5 text-sm">
            <FeatureToggle
              label={t("admin.dashboard.plansForm.gifEnabled")}
              checked={Boolean(form[tier].gif)}
              onChange={(v) => patchLimits(tier, { gif: v })}
            />
            <FeatureToggle
              label={t("admin.dashboard.plansForm.subtitlesEnabled")}
              checked={Boolean(form[tier].subtitles)}
              onChange={(v) => patchLimits(tier, { subtitles: v })}
            />
            <FeatureToggle
              label={t("admin.dashboard.plansForm.playlistEnabled")}
              checked={Boolean(form[tier].playlist)}
              onChange={(v) => patchLimits(tier, { playlist: v })}
            />
          </div>
        </SectionCard>
      ))}

      <SectionCard title={t("admin.dashboard.pricing")}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.monthlyPrice")}</label>
            <NumberInput value={form.pricing.monthlyPriceEur} suffix="€" onChange={(v) => setForm({ ...form, pricing: { ...form.pricing, monthlyPriceEur: v } })} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">{t("admin.dashboard.plansForm.yearlyPrice")}</label>
            <NumberInput value={form.pricing.yearlyPriceEur} suffix="€" onChange={(v) => setForm({ ...form, pricing: { ...form.pricing, yearlyPriceEur: v } })} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">{t("admin.dashboard.plansForm.zeroUnlimited")}</p>
      </SectionCard>

      <button
        onClick={save}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:opacity-90 disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {busy ? "…" : t("admin.dashboard.saveChanges")}
      </button>
      {msg === "ok" && <span className="ml-3 text-sm text-success">{t("admin.dashboard.plansForm.saved")}</span>}
      {msg === "err" && <span className="ml-3 text-sm text-destructive">{t("admin.dashboard.plansForm.saveFailed")}</span>}
    </>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
        active
          ? "bg-brand-600 text-white border-brand-600"
          : "bg-muted border-border text-muted-foreground hover:border-brand-400"
      }`}
    >
      {label}
    </button>
  );
}

function FeatureToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand-600" />
      {label}
    </label>
  );
}

/* -------------------------------- Activité -------------------------------- */

function ActivityTab() {
  const { t } = useI18n();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/activity");
    if (res.ok) setItems((await res.json()).items);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <ActivityIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" /> {t("admin.dashboard.activity")}
      </h1>
      <SectionCard>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">…</div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{t("admin.dashboard.activityEmpty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="py-3 flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words">{it.action}</p>
                  {it.detail && <p className="text-xs text-muted-foreground break-words">{it.detail}</p>}
                </div>
                <div className="text-[10px] text-muted-foreground shrink-0 text-right">
                  <p>{it.actor}</p>
                  <p>{new Date(it.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}

/* ----------------------------- Backup (local) ----------------------------- */

function BackupTab() {
  const { t } = useI18n();
  const [importStatus, setImportStatus] = useState("");

  const handleExport = () => {
    const blob = new Blob([exportSettings()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vidversal-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm(t("admin.dashboard.resetConfirm"))) {
      resetSettings();
      setImportStatus(t("admin.dashboard.resetDone"));
      setTimeout(() => location.reload(), 600);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        saveSettings({ ...DEFAULT_SETTINGS, ...parsed });
        setImportStatus(t("admin.dashboard.importOk"));
        localStorage.setItem("vidversal-settings", JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
        setTimeout(() => location.reload(), 700);
      } catch {
        setImportStatus(t("admin.dashboard.importInvalid"));
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <DatabaseBackup className="w-6 h-6 text-brand-600 dark:text-brand-400" /> {t("admin.dashboard.backup")}
      </h1>

      <SectionCard
        title={t("admin.dashboard.exportImport")}
        description={t("admin.dashboard.exportDesc")}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
          >
            <DownloadCloud className="w-4 h-4" /> {t("admin.dashboard.exportBtn")}
          </button>
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium cursor-pointer hover:bg-muted transition-colors">
            <DatabaseBackup className="w-4 h-4" /> {t("admin.dashboard.importBtn")}
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
          >
            {t("admin.dashboard.reset")}
          </button>
        </div>
        {importStatus && (
          <p className="text-xs text-success mt-3">{importStatus}</p>
        )}
      </SectionCard>

      <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
        <Download className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("admin.dashboard.tip")}
        </p>
      </div>
    </>
  );
}