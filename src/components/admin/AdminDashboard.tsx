"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Download,
  Coins,
  DatabaseBackup,
  LogOut,
  Save,
  ExternalLink,
  Home,
  DownloadCloud,
  Lock,
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

type Tab = "general" | "pricing" | "backup";

export function AdminDashboard() {
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

  const updateNested = <K extends "free" | "pro">(
    key: K,
    patch: Partial<AppSettings[K]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
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
          <p className="text-xs text-muted-foreground mt-0.5">Administration</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <AdminNavItem
            icon={<Settings className="w-4 h-4" />}
            label="Général"
            active={tab === "general"}
            onClick={() => setTab("general")}
          />
          <AdminNavItem
            icon={<Coins className="w-4 h-4" />}
            label="Tarifs"
            active={tab === "pricing"}
            onClick={() => setTab("pricing")}
          />
          <AdminNavItem
            icon={<DatabaseBackup className="w-4 h-4" />}
            label="Sauvegarde"
            active={tab === "backup"}
            onClick={() => setTab("backup")}
          />
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" /> Voir le site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-20 border-b border-border bg-card flex items-center justify-between px-4 py-3">
        <p className="font-bold">
          <span className="text-brand-600 dark:text-brand-400">Vid</span>versal
          <span className="text-xs font-normal text-muted-foreground ml-2">Admin</span>
        </p>
        <div className="flex gap-2">
          <Link
            href="/"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Voir le site"
          >
            <Home className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Déconnexion"
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
            <MobileTab label="Général" active={tab === "general"} onClick={() => setTab("general")} />
            <MobileTab label="Tarifs" active={tab === "pricing"} onClick={() => setTab("pricing")} />
            <MobileTab label="Sauvegarde" active={tab === "backup"} onClick={() => setTab("backup")} />
          </div>

          <div className="sm:pt-10">
            {tab === "general" && <GeneralTab settings={settings} updateNested={updateNested} update={update} />}
            {tab === "pricing" && <PricingTab settings={settings} updateNested={updateNested} />}
            {tab === "backup" && <BackupTab />}
          </div>

          {/* Save bar */}
          <div className="sm:hidden sticky bottom-0 inset-x-0 bg-card border-t border-border p-3 mt-6 flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            {saved && <span className="text-xs text-success shrink-0">Enregistré ✓</span>}
          </div>
        </div>
      </main>

      {/* Desktop save button */}
      <button
        onClick={handleSave}
        className="sm:flex hidden fixed bottom-6 right-6 items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg hover:opacity-90 transition-all"
      >
        <Save className="w-4 h-4" /> Enregistrer les modifications
      </button>
      {saved && (
        <span className="hidden sm:block fixed bottom-6 left-64 text-sm text-success bg-success/10 border border-success/30 rounded-full px-4 py-2 z-50">
          Modifications enregistrées
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
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 mb-4">{description}</p>
      )}
      {!description && <div className="mb-4" />}
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
        value={value}
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
  updateNested,
}: {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  updateNested: <K extends "free" | "pro">(key: K, patch: Partial<AppSettings[K]>) => void;
}) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Général
      </h1>

      <SectionCard
        title="Téléchargements"
        description="Active ou désactive les téléchargements sur le site (utile tant que le worker n'est pas hébergé)."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-muted-foreground" />
              Téléchargement activé
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Si désactivé, un message « bientôt disponible » s&apos;affiche.
            </p>
          </div>
          <Switch
            checked={settings.downloadEnabled}
            onChange={(v) => update({ downloadEnabled: v })}
          />
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium mb-1.5 block">URL du worker (backend yt-dlp)</label>
          <input
            type="text"
            value={settings.publicWorkerUrl}
            onChange={(e) => update({ publicWorkerUrl: e.target.value })}
            placeholder="https://votre-worker.example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Laissez vide pour utiliser les routes /api du site (utile en dev local).
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Bandeau d'information"
        description="Affiche un message sous le champ de recherche (annonce, maintenance, promo...)."
      >
        <input
          type="text"
          value={settings.bannerText}
          onChange={(e) => update({ bannerText: e.target.value })}
          placeholder="Ex : 🔒 Videz la 4K en beta — sans compte requise..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </SectionCard>

      <SectionCard
        title="Limites du plan gratuit"
        description="Quotas appliqués aux utilisateurs sans abonnement."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">Qualité max</label>
            <NumberInput
              value={settings.free.maxQuality}
              suffix="p"
              onChange={(v) => updateNested("free", { maxQuality: v })}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Téléchargements / jour</label>
            <NumberInput
              value={settings.free.dailyLimit}
              onChange={(v) => updateNested("free", { dailyLimit: v })}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Taille du batch</label>
            <NumberInput
              value={settings.free.batchSize}
              suffix="vid."
              onChange={(v) => updateNested("free", { batchSize: v })}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function PricingTab({
  settings,
  updateNested,
}: {
  settings: AppSettings;
  updateNested: <K extends "free" | "pro">(key: K, patch: Partial<AppSettings[K]>) => void;
}) {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <Coins className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Tarifs
      </h1>

      <SectionCard
        title="Abonnement PRO"
        description="Prix affichés sur la page /pricing et utilisés pour Stripe."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">Prix mensuel (€)</label>
            <NumberInput
              value={settings.pro.monthlyPriceEur}
              suffix="€"
              onChange={(v) => updateNested("pro", { monthlyPriceEur: v })}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">
              Prix annuel (€) <span className="text-success">−34%</span>
            </label>
            <NumberInput
              value={settings.pro.yearlyPriceEur}
              suffix="€"
              onChange={(v) => updateNested("pro", { yearlyPriceEur: v })}
            />
          </div>
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
        <Lock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Les clés Stripe ne sont pas encore branchées. Quand ce sera fait, ces prix
          devront être ceux créés dans votre tableau de bord Stripe (price IDs).
        </p>
      </div>
    </>
  );
}

function BackupTab() {
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
    if (confirm("Réinitialiser tous les paramètres aux valeurs par défaut ?")) {
      resetSettings();
      setImportStatus("Paramètres réinitialisés. Rechargez la page.");
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
        setImportStatus("Paramètres importés avec succès.");
        localStorage.setItem("vidversal-settings", JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
        setTimeout(() => location.reload(), 700);
      } catch {
        setImportStatus("Fichier invalide.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <DatabaseBackup className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Sauvegarde
      </h1>

      <SectionCard
        title="Export / Import"
        description="Vos paramètres sont stockés dans le navigateur. Exportez-les en JSON pour les conserver ou les transférer."
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
          >
            <DownloadCloud className="w-4 h-4" /> Exporter le fichier JSON
          </button>
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium cursor-pointer hover:bg-muted transition-colors">
            <DatabaseBackup className="w-4 h-4" /> Importer un fichier
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
        {importStatus && (
          <p className="text-xs text-success mt-3">{importStatus}</p>
        )}
      </SectionCard>

      <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
        <Download className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Astuce : exportez ce fichier après chaque changement important et rangez-le
          avec vos autres fichiers du projet. Il peut être restauré depuis n&apos;importe
          quel navigateur.
        </p>
      </div>
    </>
  );
}