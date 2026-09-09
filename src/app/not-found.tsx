import Link from "next/link";
import { SearchX, Home, Download } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <SearchX className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-2">
        Erreur 404
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">
        Cette page n&apos;existe pas
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md">
        Le lien que vous avez suivi est peut-être cassé, ou la page a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>
        <Link
          href="/#download"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4" /> Télécharger une vidéo
        </Link>
      </div>
    </div>
  );
}