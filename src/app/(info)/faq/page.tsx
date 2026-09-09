import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";

export const metadata = {
  title: "FAQ — Vidversal",
};

const faqs = [
  {
    q: "Quelles plateformes sont supportées ?",
    a: "YouTube, TikTok, Instagram, X/Twitter, Facebook, Twitch, Vimeo, Dailymotion, Reddit, et la plupart des sites de partage vidéo. Collez simplement le lien et laissez Vidversal faire le reste.",
  },
  {
    q: "Est-ce gratuit ?",
    a: "Oui. Le plan gratuit permet de télécharger jusqu'à 1080p avec un quota quotidien. Le plan PRO (9,99€/mois) débloque la 4K/8K, le batch, les playlists, l'audio FLAC/WAV, les sous-titres et le GIF.",
  },
  {
    q: "Est-ce légal de télécharger des vidéos ?",
    a: "Vidversal est un outil à usage personnel. Vous êtes responsable des contenus que vous téléchargez et devez respecter les droits d'auteur. Vidversal ne contourne pas les DRM.",
  },
  {
    q: "Quelle qualité maximum possible ?",
    a: "Le plan gratuit monte à 1080p. Le plan PRO débloque la 4K et la 8K lorsque la vidéo source le permet.",
  },
  {
    q: "Puis-je télécharger une playlist ou une chaîne entière ?",
    a: "Oui, cette fonctionnalité est incluse dans le plan PRO. Vous pouvez télécharger une playlist YouTube complète d'un seul clic.",
  },
  {
    q: "Comment fonctionne la conversion audio ?",
    a: "Collez un lien, cliquez sur « Audio », choisissez le format (MP3, FLAC, WAV, AAC, OPUS) et Vidversal extrait l'audio de la vidéo.",
  },
  {
    q: "Mes téléchargements sont-ils stockés ?",
    a: "Non. Les fichiers sont générés à la volée et supprimés immédiatement après votre téléchargement. Nous ne stockons aucune vidéo.",
  },
  {
    q: "Comment créer un compte ?",
    a: "Cliquez sur « S'inscrire » en haut de la page. Compte gratuit en 30 secondes avec votre e-mail ou Google.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        Questions fréquentes
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Tout ce qu&apos;il faut savoir sur Vidversal.
      </p>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-card p-4 open:bg-muted/30"
          >
            <summary className="flex items-center justify-between list-none cursor-pointer text-sm font-medium text-foreground">
              {f.q}
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-3 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        Une autre question ?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contactez-nous
        </Link>
        .
      </p>
    </>
  );
}