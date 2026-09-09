import Link from "next/link";
import { ArrowLeft, Rocket, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "À propos — Vidversal",
};

export default function AboutPage() {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold mb-4">À propos de Vidversal</h1>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Vidversal</span> est né
          d&apos;une idée simple : un seul outil, un seul champ de texte, et
          n&apos;importe quelle vidéo de n&apos;importe quelle plateforme devient
          téléchargeable.
        </p>
        <p>
          Pas de logiciel à installer, pas de sites remplis de publicités
          agressives. Collez un lien, choisissez votre qualité et votre format,
          c&apos;est tout.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Zap className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
            <p className="font-semibold text-foreground text-sm">Rapide</p>
            <p className="text-xs mt-1">
              Téléchargements optimisés, fichiers générés à la volée et jamais stockés.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
            <p className="font-semibold text-foreground text-sm">Sécurisé</p>
            <p className="text-xs mt-1">
              Aucune donnée ne transite hors de votre navigateur vers un service tiers.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Rocket className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-2" />
            <p className="font-semibold text-foreground text-sm">Universel</p>
            <p className="text-xs mt-1">
              YouTube, TikTok, Instagram, X, Facebook, Twitch et 1000+ autres sites.
            </p>
          </div>
        </div>

        <p>
          Vidversal est un projet indépendant et passionné, pensé pour un usage
          personnel et dans le respect des droits des créateurs.
        </p>
      </div>
    </>
  );
}