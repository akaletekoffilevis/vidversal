"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function Header() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-20 bg-background/80 backdrop-blur-md border-b border-border transition-shadow duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-brand-600 dark:text-brand-400">Vid</span>
            <span className="text-foreground">versal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="#features"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            Tarifs
          </Link>
          <Link
            href="/login"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="ml-2 text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            S&apos;inscrire
          </Link>

          <ThemeToggleButton theme={theme} toggle={toggle} />
        </nav>

        {/* Mobile: toggle + burger */}
        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggleButton theme={theme} toggle={toggle} />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden mx-4 rounded-2xl border border-border bg-card p-3 shadow-lg">
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              Accueil
            </Link>
            <Link
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              Tarifs
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 text-sm font-medium text-center rounded-lg bg-primary text-primary-foreground"
            >
              S&apos;inscrire
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function ThemeToggleButton({
  theme,
  toggle,
}: {
  theme: "light" | "dark";
  toggle: () => void;
}) {
  return (
    <button
      onClick={toggle}
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
      className="relative ml-1 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors overflow-hidden"
    >
      <span
        className={`absolute transition-all duration-300 ease-out ${
          theme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-75"
        }`}
      >
        <Moon className="w-[18px] h-[18px]" />
      </span>
      <span
        className={`absolute transition-all duration-300 ease-out ${
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
        }`}
      >
        <Sun className="w-[18px] h-[18px]" />
      </span>
    </button>
  );
}