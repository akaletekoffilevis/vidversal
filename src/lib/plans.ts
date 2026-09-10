import { Tier, TierLimits, TIER_LIMITS } from "./types";
import { getSetting, setSetting } from "./db";

// Plans administrables côté serveur (base Neon). Les limites par défaut sont
// celles de TIER_LIMITS ; l'admin peut les surcharger dans /admin → Plans.

export type AudioFormat = TierLimits["audioFormats"][number];
export type VideoFormat = TierLimits["videoFormats"][number];

export interface PlanConfig {
  free: TierLimits;
  pro: TierLimits;
  pricing: { monthlyPriceEur: number; yearlyPriceEur: number };
}

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
  free: { ...TIER_LIMITS.free },
  pro: { ...TIER_LIMITS.pro },
  pricing: { monthlyPriceEur: 9.99, yearlyPriceEur: 79 },
};

const SETTINGS_KEY = "plans";

export function normalizeLimits(raw: unknown, tier: Tier): TierLimits {
  const base = TIER_LIMITS[tier];
  const src = (raw ?? {}) as Record<string, unknown>;
  const clampNum = (v: unknown, fallback: number): number => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return {
    maxQuality: clampNum(src.maxQuality, base.maxQuality),
    maxDurationSec: clampNum(src.maxDurationSec, base.maxDurationSec),
    batchSize: clampNum(src.batchSize, base.batchSize),
    audioFormats: Array.isArray(src.audioFormats) && src.audioFormats.length
      ? (src.audioFormats as AudioFormat[])
      : [...base.audioFormats],
    videoFormats: Array.isArray(src.videoFormats) && src.videoFormats.length
      ? (src.videoFormats as VideoFormat[])
      : [...base.videoFormats],
    gif: typeof src.gif === "boolean" ? src.gif : base.gif,
    subtitles: typeof src.subtitles === "boolean" ? src.subtitles : base.subtitles,
    playlist: typeof src.playlist === "boolean" ? src.playlist : base.playlist,
    dailyDownloads: clampNum(src.dailyDownloads, base.dailyDownloads),
    maxFileSizeMB: clampNum(src.maxFileSizeMB, base.maxFileSizeMB),
    parallelDownloads: clampNum(src.parallelDownloads, base.parallelDownloads),
  };
}

export function normalizePlanConfig(raw: unknown): PlanConfig {
  const src = (raw ?? {}) as Record<string, any>;
  return {
    free: normalizeLimits(src.free, "free"),
    pro: normalizeLimits(src.pro, "pro"),
    pricing: {
      monthlyPriceEur: Number(src.pricing?.monthlyPriceEur) || 9.99,
      yearlyPriceEur: Number(src.pricing?.yearlyPriceEur) || 79,
    },
  };
}

let cache: PlanConfig | null = null;

export async function getPlanConfig(): Promise<PlanConfig> {
  if (cache) return cache;
  const stored = await getSetting<Partial<PlanConfig>>(SETTINGS_KEY).catch(() => null);
  cache = stored ? normalizePlanConfig(stored) : { ...DEFAULT_PLAN_CONFIG };
  return cache;
}

export async function setPlanConfig(config: PlanConfig): Promise<void> {
  cache = config;
  await setSetting(SETTINGS_KEY, config as unknown as Record<string, unknown>);
}

export function resetPlanConfigCache(): void {
  cache = null;
}

export function resolveLimits(tier: Tier, config: PlanConfig): TierLimits {
  return tier === "pro" ? config.pro : config.free;
}