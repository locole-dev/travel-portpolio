import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { LOCALE_STORAGE_KEY, type Locale, useI18n } from "../i18n/I18nContext";
import { en } from "../i18n/locales/en";
import { vi as viMessages } from "../i18n/locales/vi";

/** First visit to the public site: choose English or Vietnamese. Hidden on /admin and after choice. */
export function LanguagePromptModal() {
  const location = useLocation();
  const { setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setOpen(false);
      return;
    }
    setOpen(!localStorage.getItem(LOCALE_STORAGE_KEY));
  }, [location.pathname]);

  if (!open || location.pathname.startsWith("/admin")) {
    return null;
  }

  function pick(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-prompt-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-sm rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-8 shadow-2xl shadow-on-surface/15"
      >
        <h2
          id="lang-prompt-title"
          className="font-display text-center text-xl font-black leading-snug tracking-tight text-on-surface sm:text-2xl"
        >
          {en.languagePrompt.title}
          <span className="mt-1 block text-base font-bold text-on-surface/70 sm:text-lg">
            {viMessages.languagePrompt.title}
          </span>
        </h2>
        <p className="mt-3 space-y-1 text-center text-sm leading-relaxed text-on-surface/55">
          <span className="block">{en.languagePrompt.subtitle}</span>
          <span className="block">{viMessages.languagePrompt.subtitle}</span>
        </p>
        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={() => pick("en")}
            className="h-14 rounded-2xl bg-primary font-semibold text-on-primary shadow-lg transition hover:opacity-95 active:scale-[0.99]"
          >
            {en.languagePrompt.english}
          </button>
          <button
            type="button"
            onClick={() => pick("vi")}
            className="h-14 rounded-2xl border-2 border-primary/25 bg-white font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.99]"
          >
            {viMessages.languagePrompt.vietnamese}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
