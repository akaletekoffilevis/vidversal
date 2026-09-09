"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Check, Lock, Crown } from "lucide-react";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";

const freeFeatures = [
  "Téléchargement 1080p",
  "Toutes les plateformes",
  "MP4 standard",
  "MP3 128 kbps",
  "10 téléchargements / jour",
  "Mode sombre",
];

const proFeatures = [
  "Qualité 4K / 8K",
  "Téléchargement batch (50 liens)",
  "Playlists & chaînes complètes",
  "Formats : MP4, WebM, MKV, MOV, AVI",
  "Audio : MP3, FLAC, WAV, AAC, OPUS",
  "Sous-titres & traduction (IA)",
  "Création de GIF animé",
  "Téléchargements illimités",
  "Vitesse prioritaire",
  "Upload cloud + historique illimité",
  "Zéro publicité",
];

export default function PricingPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    const apply = () => setSettings(getSettings());
    apply();
    window.addEventListener("vidversal-settings-changed", apply);
    return () => window.removeEventListener("vidversal-settings-changed", apply);
  }, []);

  const monthly = settings.pro.monthlyPriceEur.toFixed(2).replace(".00", "");
  const yearly = String(settings.pro.yearlyPriceEur);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 pt-32 sm:pt-36 pb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 px-4">
          Choisissez votre plan
        </h1>
        <p className="text-muted-foreground text-center mb-10 sm:mb-12 max-w-md px-4">
          Commencez gratuitement, passez PRO quand vous en avez besoin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl px-1">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">Free</h2>
            <p className="text-3xl font-bold mb-6">0€</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-center hover:bg-muted transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-brand-500 bg-card p-6 flex flex-col relative shadow-lg shadow-brand-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-brand-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              <Crown className="w-3 h-3" /> POPULAIRE
            </span>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              PRO <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </h2>
            <p className="text-3xl font-bold mb-1">
              {monthly}€
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / mois
              </span>
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              ou {yearly}€/an (−34%)
            </p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium text-center hover:bg-brand-700 transition-colors"
            >
              Passer PRO
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center max-w-md px-4">
          Fonctionnement par crédits ou abonnement. Page 100% demo — le paiement
          Stripe sera branché sur votre compte.
        </p>
      </main>
      <Footer />
    </div>
  );
}