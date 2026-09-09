import Link from "next/link";
import { Heart } from "lucide-react";

const links = [
  { href: "/terms", label: "Conditions" },
  { href: "/privacy", label: "Confidentialité" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/legal", label: "Mentions légales" },
  { href: "/about", label: "À propos" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            Fait avec <Heart className="w-3 h-3 text-red-500 fill-red-500" /> par Vidversal
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Vidversal est un outil de téléchargement à usage personnel uniquement. Respectez les droits d&apos;auteur.
        </p>
      </div>
    </footer>
  );
}
