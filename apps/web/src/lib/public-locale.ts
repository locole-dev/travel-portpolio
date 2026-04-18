export type PublicLocale = "en" | "vi";

export function parseLocaleFromApiPath(path: string): PublicLocale {
  const q = path.includes("?") ? path.slice(path.indexOf("?")) : "";
  const params = new URLSearchParams(q);
  const raw = (params.get("locale") ?? params.get("lang") ?? "").toLowerCase();
  if (raw === "vi" || raw === "vn") return "vi";
  return "en";
}

export function pickLocalized(en: string, vi: string | null | undefined, locale: PublicLocale): string {
  if (locale === "vi") {
    const v = (vi ?? "").trim();
    if (v.length > 0) return v;
  }
  return en;
}

export function pickLocalizedNullable(
  en: string | null | undefined,
  vi: string | null | undefined,
  locale: PublicLocale
): string | null {
  if (locale === "vi") {
    const v = (vi ?? "").trim();
    if (v.length > 0) return v;
    return en ?? null;
  }
  return en ?? null;
}
