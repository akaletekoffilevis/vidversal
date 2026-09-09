"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useI18n } from "@/lib/i18n";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { theme, toggle } = useTheme();
  const { locale, t, setLocale } = useI18n();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextLocale: "fr" | "en" = locale === "fr" ? "en" : "fr";
  const role = (session?.user as { role?: string } | undefined)?.role;
  const user = session?.user;

  const onLogout = () => {
    setOpen(false);
    signOut({ callbackUrl: "/" });
  };

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

          {user ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-muted rounded-full transition-colors"
                >
                  {t("header.admin")}
                </Link>
              )}
              <span
                className="px-3 py-2 text-sm font-medium text-foreground truncate max-w-[160px]"
                title={user.email || undefined}
              >
                {user.name || user.email}
              </span>
              <button
                onClick={onLogout}
                aria-label={t("header.logout")}
                title={t("header.logout")}
                className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}

          <LangToggleButton target={nextLocale} onClick={() => setLocale(nextLocale)} />
          <ThemeToggleButton theme={theme} toggle={toggle} />
        </nav>

        {/* Mobile: toggle + burger */}
        <div className="flex sm:hidden items-center gap-1">
          <LangToggleButton target={nextLocale} onClick={() => setLocale(nextLocale)} />
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
            {user ? (
              <>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted text-brand-600 dark:text-brand-400"
                  >
                    {t("header.admin")}
                  </Link>
                )}
                <span className="px-3 py-2.5 text-sm font-medium text-foreground truncate">
                  {user.name || user.email}
                </span>
                <button
                  onClick={onLogout}
                  className="px-3 py-2.5 text-sm text-muted-foreground rounded-lg hover:bg-muted text-left"
                >
                  {t("header.logout")}
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function LangToggleButton({ target, onClick }: { target: "fr" | "en"; onClick: () => void }) {
  const { t } = useI18n();
  const label = target === "fr" ? t("header.switchToFrench") : t("header.switchToEnglish");
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {target === "fr" ? (
        <FranceFlag className="w-6 h-4" />
      ) : (
        <UkFlag className="w-6 h-4" />
      )}
    </button>
  );
}

function FranceFlag({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex overflow-hidden rounded-[3px] ring-1 ring-black/15 dark:ring-white/25 ${className}`}
    >
      <svg viewBox="0 0 24 16" className="w-full h-full" aria-hidden="true">
        <rect width="8" height="16" fill="#0055A4" />
        <rect x="8" width="8" height="16" fill="#FFFFFF" />
        <rect x="16" width="8" height="16" fill="#EF4135" />
      </svg>
    </span>
  );
}

function UkFlag({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex overflow-hidden rounded-[3px] ring-1 ring-black/15 dark:ring-white/25 ${className}`}
    >
      <svg viewBox="0 0 640 480" className="w-full h-full" aria-hidden="true">
        <path fill="#012169" d="M0 0h640v480H0z" />
        <path
          fill="#FFFFFF"
          d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"
        />
        <path
          fill="#C8102E"
          d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"
        />
        <path fill="#FFFFFF" d="M241 0v480h158V0H241zM0 204v72h640v-72H0z" />
        <path fill="#C8102E" d="M263 0v204h377v72H263v204h-46V276H0v-72h217V0h46z" />
      </svg>
    </span>
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