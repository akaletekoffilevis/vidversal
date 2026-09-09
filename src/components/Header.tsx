"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { theme, toggle } = useTheme();
  const { locale, loc, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextLocale: "fr" | "en" = locale === "fr" ? "en" : "fr";

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
            {t("header.features")}
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            {t("header.pricing")}
          </Link>
          <Link
            href="/login"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            {t("header.login")}
          </Link>
          <Link
            href="/signup"
            className="ml-2 text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {t("header.signup")}
          </Link>

          <LangToggleButton lang={loc[nextLocale]} onClick={() => setLocale(nextLocale)} />
          <ThemeToggleButton theme={theme} toggle={toggle} />
        </nav>

        {/* Mobile: toggle + burger */}
        <div className="flex sm:hidden items-center gap-1">
          <LangToggleButton lang={loc[nextLocale]} onClick={() => setLocale(nextLocale)} />
          <ThemeToggleButton theme={theme} toggle={toggle} />
          <button
            onClick={() => setOpen(!open)}
            aria-label={t("header.menu")}
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
              {t("header.home")}
            </Link>
            <Link
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              {t("header.features")}
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              {t("header.pricing")}
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg hover:bg-muted"
            >
              {t("header.login")}
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 text-sm font-medium text-center rounded-lg bg-primary text-primary-foreground"
            >
              {t("header.signup")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function LangToggleButton({ lang, onClick }: { lang: string; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      onClick={onClick}
      aria-label={t("header.langToggle")}
      title={t("header.langToggle")}
      className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors gap-1 text-xs font-semibold"
    >
      <Globe className="w-4 h-4" />
      {lang}
    </button>
  );
}

function ThemeToggleButton({
  theme,
  toggle,
}: {
  theme: "light" | "dark";
  toggle: () => void;
}) {
  const { t } = useI18n();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "light" ? t("header.themeLight") : t("header.themeDark")}
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