import { Tier, TIER_LIMITS, TierLimits } from "./types";
import { auth } from "./auth";
import { countDownloadsToday, getDbUserByEmail } from "./db";
import { getPlanConfig, resolveLimits } from "./plans";

export type AnyTierLimits = TierLimits;

export interface TierCheck {
  tier: Tier;
  limits: TierLimits;
  isPremium: boolean;
  userId?: string;
  banned?: boolean;
  usageToday: number;
}

/**
 * Détermine le niveau de l'utilisateur :
 *  - connecté : tier stocké en base (free/pro) + limites administrées (plans)
 *  - anonyme : tier free avec les limites administrées pour le plan free
 */
export async function getTier(): Promise<TierCheck> {
  const config = await getPlanConfig();
  const session = await auth().catch(() => null);
  const user = session?.user;

  if (user && user.email) {
    const dbUser = await getDbUserByEmail(user.email).catch(() => null);
    if (dbUser) {
      const tier: Tier = dbUser.tier === "pro" ? "pro" : "free";
      const usageToday = await countDownloadsToday(dbUser.id).catch(() => 0);
      return {
        tier,
        limits: resolveLimits(tier, config),
        isPremium: tier === "pro",
        userId: dbUser.id,
        banned: dbUser.banned,
        usageToday,
      };
    }
  }

  return {
    tier: "free",
    limits: resolveLimits("free", config),
    isPremium: false,
    usageToday: 0,
  };
}

/** Vérifie qu'un format audio demandé est autorisé pour ce tier */
export function assertAudioFormat(tier: Tier, format: string, limits?: TierLimits) {
  const allowed = limits?.audioFormats ?? TIER_LIMITS[tier].audioFormats;
  if (!allowed.includes(format as never)) {
    throw new TierError(
      `Le format audio "${format}" est réservé aux membres PRO`
    );
  }
}

/** Vérifie qu'un format vidéo demandé est autorisé pour ce tier */
export function assertVideoFormat(tier: Tier, format: string, limits?: TierLimits) {
  const allowed = limits?.videoFormats ?? TIER_LIMITS[tier].videoFormats;
  if (!allowed.includes(format as never)) {
    throw new TierError(
      `Le format vidéo "${format}" est réservé aux membres PRO`
    );
  }
}

/** Plafonne la qualité à la limite du tier */
export function clampQuality(tier: Tier, height: number | null, limits?: TierLimits): number | null {
  if (height === null) return null;
  const cap = limits?.maxQuality ?? TIER_LIMITS[tier].maxQuality;
  return Math.min(height, cap);
}

export class TierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TierError";
  }
}

export function isTierError(err: unknown): err is TierError {
  return err instanceof TierError;
}