"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { messagesFr } from "./messages/fr";
import { messagesEn } from "./messages/en";

export type Locale = "fr" | "en";

const STORAGE_KEY = "vidversal-lang";
const DICTIONARIES: Record<Locale, typeof messagesFr> = {
  fr: messagesFr,
  en: messagesEn,
};

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  const browser = window.navigator.language?.toLowerCase() ?? "";
  return browser.startsWith("fr") ? "fr" : "en";
}

export interface I18n {
  locale: Locale;
  loc: Record<Locale, string>;
  t: (path: string, vars?: Record<string, string | number>) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      let value: unknown = DICTIONARIES[locale];
      for (const part of path.split(".")) {
        if (value && typeof value === "object") value = (value as Record<string, unknown>)[part];
        else return path;
      }
      if (typeof value !== "string") return path;
      if (vars) {
        return Object.entries(vars).reduce(
          (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(val)),
          value,
        );
      }
      return value;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, loc: { fr: "Français", en: "English" }, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}