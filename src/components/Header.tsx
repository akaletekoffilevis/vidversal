"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-brand-600 dark:text-brand-400">Vid</span>
          <span className="text-foreground">versal</span>
        </span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href="#features"
          className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Fonctionnalités
        </Link>
        <Link
          href="/pricing"
          className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Tarifs
        </Link>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium px-4 py-2 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          S&apos;inscrire
        </Link>
        <button
          onClick={toggle}
          aria-label="Changer de thème"
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </nav>
    </header>
  );
}
