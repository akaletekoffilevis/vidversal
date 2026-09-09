import { Tier, TIER_LIMITS } from "./types";

export interface TierCheck {
  tier: Tier;
  limits: typeof TIER_LIMITS.pro;
  isPremium: boolean;
}

/**
 * Détermine le niveau de l'utilisateur.
 * Lorsque Supabase est configuré, on vérifie le statut premium de l'utilisateur connecté.
 * Sans Supabase configuré, tout le monde est "free" (mode démo).
 */
export async function getTier(requester?: {
  userId?: string;
  email?: string;
}): Promise<TierCheck> {
  // TODO: quand Supabase sera branché, lire le profil premium depuis la BDD
  // const supabase = ... ; const { data } = await supabase.from("profiles").select("tier").eq("id", requester.userId).single();
  // if (data?.tier === "pro") return { tier: "pro", limits: TIER_LIMITS.pro, isPremium: true };

  return {
    tier: "free",
    limits: TIER_LIMITS.free,
    isPremium: false,
  };
}

/** Vérifie qu'un format audio demandé est autorisé pour ce tier */
export function assertAudioFormat(tier: Tier, format: string) {
  const allowed = TIER_LIMITS[tier].audioFormats;
  if (!allowed.includes(format as never)) {
    throw new TierError(
      `Le format audio "${format}" est réservé aux membres PRO`
    );
  }
}

/** Vérifie qu'un format vidéo demandé est autorisé pour ce tier */
export function assertVideoFormat(tier: Tier, format: string) {
  const allowed = TIER_LIMITS[tier].videoFormats;
  if (!allowed.includes(format as never)) {
    throw new TierError(
      `Le format vidéo "${format}" est réservé aux membres PRO`
    );
  }
}

/** Plafonne la qualité à la limite du tier */
export function clampQuality(tier: Tier, height: number | null): number | null {
  if (height === null) return null;
  return Math.min(height, TIER_LIMITS[tier].maxQuality);
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