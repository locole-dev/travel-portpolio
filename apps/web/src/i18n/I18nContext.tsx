import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import type { Messages } from "./locales/en";
import { en } from "./locales/en";
import { vi } from "./locales/vi";

export type Locale = "en" | "vi";

export const LOCALE_STORAGE_KEY = "twentynine.locale";

const catalogs: Record<Locale, Messages> = { en, vi };

function lookup(messages: Messages, key: string): string {
  const parts = key.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === "string" ? cur : key;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "vi") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const t = useCallback((key: string) => lookup(catalogs[locale], key), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "vi" ? "vi" : "en";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
