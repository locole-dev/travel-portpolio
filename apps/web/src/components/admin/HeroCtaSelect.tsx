import { useEffect, useRef, useState } from "react";
import { ChevronDown, Link2 } from "lucide-react";

import { getIcon } from "../../lib/icons";
import type { ContactMethod } from "../../types/content";

export type HeroCtaPreset = { id: string; label: string; link: string };

const EMAIL_PLATFORMS = new Set(["mail", "email", "gmail"]);

function humanizePlatform(platform: string): string {
  const p = platform.toLowerCase();
  const map: Record<string, string> = {
    whatsapp: "WhatsApp",
    kakaotalk: "KakaoTalk",
    zalo: "Zalo",
    line: "Line",
    instagram: "Instagram",
    wechat: "WeChat",
    gmail: "Gmail",
    mail: "Email",
    email: "Email"
  };
  return map[p] ?? platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

/** Label shown in hero CTA for a contact (saved with profile). */
export function contactCtaLabel(c: ContactMethod): string {
  const p = c.platform.toLowerCase();
  if (EMAIL_PLATFORMS.has(p)) return "Send email";
  return `Chat on ${humanizePlatform(c.platform)}`;
}

function triggerLabel(
  value: string,
  contacts: ContactMethod[],
  presets: readonly HeroCtaPreset[]
): string {
  if (value === "custom") return "Custom…";
  if (value.startsWith("c:")) {
    const id = value.slice(2);
    const c = contacts.find((x) => x.id === id);
    return c ? contactCtaLabel(c) : "Custom…";
  }
  if (value.startsWith("p:")) {
    const id = value.slice(2);
    const p = presets.find((x) => x.id === id);
    return p?.label ?? "—";
  }
  return "Custom…";
}

const triggerClass =
  "flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant/45 bg-white px-5 text-left text-sm font-medium text-on-surface shadow-sm outline-none transition-all hover:border-outline-variant/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/8";

type HeroCtaSelectProps = {
  value: string;
  onChange: (encoded: string) => void;
  contacts: ContactMethod[];
  presets: readonly HeroCtaPreset[];
};

export function HeroCtaSelect({ value, onChange, contacts, presets }: HeroCtaSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const label = triggerLabel(value, contacts, presets);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(encoded: string) {
    onChange(encoded);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={triggerClass}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-on-surface/35 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 max-h-[min(22rem,calc(100vh-12rem))] overflow-y-auto rounded-2xl border border-outline-variant/40 bg-white py-2 shadow-xl shadow-on-surface/10 ring-1 ring-black/[0.03]"
          role="listbox"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === "custom"}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
              value === "custom"
                ? "bg-primary text-white"
                : "text-on-surface hover:bg-on-surface/[0.04]"
            }`}
            onClick={() => pick("custom")}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-on-surface/[0.06] text-on-surface/70">
              <Link2 className="h-4 w-4" />
            </span>
            Custom…
          </button>

          {contacts.length > 0 ? (
            <>
              <div className="my-2 border-t border-outline-variant/30" />

              <p className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-on-surface/40">
                Contact methods
              </p>
              {contacts.map((c) => {
                const encoded = `c:${c.id}`;
                const selected = value === encoded;
                const Icon = getIcon(c.icon);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      selected ? "bg-primary text-white" : "text-on-surface hover:bg-on-surface/[0.04]"
                    }`}
                    onClick={() => pick(encoded)}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        selected ? "bg-white/20 text-white" : "bg-primary/8 text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 truncate">{contactCtaLabel(c)}</span>
                  </button>
                );
              })}
            </>
          ) : null}

          <div className="my-2 border-t border-outline-variant/30" />

          <p className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-on-surface/40">
            On this site
          </p>
          {presets.map((p) => {
            const encoded = `p:${p.id}`;
            const selected = value === encoded;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  selected ? "bg-primary text-white" : "text-on-surface hover:bg-on-surface/[0.04]"
                }`}
                onClick={() => pick(encoded)}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    selected ? "bg-white/20 text-white" : "bg-secondary/12 text-secondary"
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
