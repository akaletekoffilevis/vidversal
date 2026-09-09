// Paramètres de l'application exécutables côté client.
// Persistés dans localStorage permettant à l'admin de tout piloter sans backend.

export type AppSettings = {
  downloadEnabled: boolean;
  publicWorkerUrl: string;
  bannerText: string;
  free: {
    maxQuality: number;
    dailyLimit: number;
    batchSize: number;
  };
  pro: {
    monthlyPriceEur: number;
    yearlyPriceEur: number;
  };
};

export const DEFAULT_SETTINGS: AppSettings = {
  downloadEnabled: false,
  publicWorkerUrl: "",
  bannerText: "",
  free: {
    maxQuality: 1080,
    dailyLimit: 10,
    batchSize: 1,
  },
  pro: {
    monthlyPriceEur: 9.99,
    yearlyPriceEur: 79,
  },
};

const KEY = "vidversal-settings";

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("vidversal-settings-changed"));
}

export function resetSettings() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("vidversal-settings-changed"));
}

/** Json d'export pour sauvegarde/manuel */
export function exportSettings(): string {
  return JSON.stringify(getSettings(), null, 2);
}