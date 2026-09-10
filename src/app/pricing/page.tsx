"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Check, Lock, Crown } from "lucide-react";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { useI18n } from "@/lib/i18n";
import type { PublicPlans } from "@/lib/usePlan";

export default function PricingPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [plans, setPlans] = useState<PublicPlans | null>(null);
  useEffect(() => {
    const apply = () => setSettings(getSettings());
    apply();
    window.addEventListener("vidversal-settings-changed", apply);
    fetch("/api/plans")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => setPlans(p))
      .catch(() => null);
    return () => window.removeEventListener("vidversal-settings-changed", apply);
  }, []);

  const defaultPricing = plans?.pricing ?? {
    monthlyPriceEur: settings.pro.monthlyPriceEur,
    yearlyPriceEur: settings.pro.yearlyPriceEur,
  };
  const monthly = (defaultPricing.monthlyPriceEur || 0).toFixed(2).replace(".00", "");
  const yearly = String(defaultPricing.yearlyPriceEur ?? 0);

  const freeCount = 6;
  const proCount = 11;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 pt-32 sm:pt-36 pb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 px-4">
          {t("pricing.title")}
        </h1>
        <p className="text-muted-foreground text-center mb-10 sm:mb-12 max-w-md px-4">
          {t("pricing.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl px-1">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">{t("pricing.freeName")}</h2>
            <p className="text-3xl font-bold mb-6">0€</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {Array.from({ length: freeCount }, (_, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                  {t(`pricing.freeList.${i}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-center hover:bg-muted transition-colors"
            >
              {t("pricing.startFree")}
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-brand-500 bg-card p-6 flex flex-col relative shadow-lg shadow-brand-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-brand-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              <Crown className="w-3 h-3" /> {t("common.popular")}
            </span>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              {t("common.pro")}{" "}
              <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </h2>
            <p className="text-3xl font-bold mb-1">
              {monthly}€
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                {t("pricing.perMonth")}
              </span>
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              {t("pricing.orYearly", { yearly })}
            </p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {Array.from({ length: proCount }, (_, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                  {t(`pricing.proList.${i}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium text-center hover:bg-brand-700 transition-colors"
            >
              {t("pricing.goPro")}
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center max-w-md px-4">
          {t("pricing.footnote")}
        </p>
      </main>
      <Footer />
    </div>
  );
}