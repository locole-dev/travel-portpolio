export type PublicLocale = "en" | "vi";

export function parsePublicLocale(query: Record<string, unknown> | undefined): PublicLocale {
  const raw = String(query?.locale ?? query?.lang ?? "").toLowerCase();
  if (raw === "vi" || raw === "vn") return "vi";
  return "en";
}

/** Use Vietnamese when non-empty; otherwise fall back to English. */
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
