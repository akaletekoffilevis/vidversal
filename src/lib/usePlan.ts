"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tier, TIER_LIMITS, TierLimits } from "@/lib/types";

export interface PublicPlans {
  free: TierLimits;
  pro: TierLimits;
  pricing: { monthlyPriceEur: number; yearlyPriceEur: number };
}

/** Limites de l'utilisateur courant (connecté : son tier, sinon free)
 *  telles que définies par l'admin dans /admin → Plans. */
export function usePlan() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<PublicPlans | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) setPlans(await res.json());
    } catch {
      /* repli sur TIER_LIMITS */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isLoggedIn = status === "authenticated";
  const tier: Tier =
    isLoggedIn && session?.user?.tier === "pro" ? "pro" : "free";
  const limits = plans ? plans[tier] : TIER_LIMITS[tier];

  return {
    plans,
    tier,
    limits,
    isLoggedIn,
    loading: !plans,
    refresh,
  };
}