"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const links: { href: string; key: string }[] = [
  { href: "/terms", key: "footer.links.terms" },
  { href: "/privacy", key: "footer.links.privacy" },
  { href: "/faq", key: "footer.links.faq" },
  { href: "/contact", key: "footer.links.contact" },
  { href: "/legal", key: "footer.links.legal" },
  { href: "/about", key: "footer.links.about" },
];

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            {t("footer.madeWith")} <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {t("footer.by")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors"
              >
                {t(l.key)}
              </Link>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          {t("footer.legalNote")}
        </p>
      </div>
    </footer>
  );
}