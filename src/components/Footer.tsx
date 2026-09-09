import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full max-w-4xl mx-auto px-4 py-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          Fait avec <Heart className="w-3 h-3 text-red-500 fill-red-500" /> par Vidversal
        </p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Conditions</a>
          <a href="#" className="hover:text-foreground transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-4">
        Vidversal est un outil de téléchargement à usage personnel uniquement. Respectez les droits d&apos;auteur.
      </p>
    </footer>
  );
}
