export type Lang = "en" | "ar";

/**
 * Every piece of CMS content is stored as parallel ar/en fields (brief
 * Section 28 — bilingual fields on all content, not a single localized
 * blob). This picks the field for the active language and falls back to
 * whichever language actually has content, so a page half-translated by an
 * editor never renders blank.
 */
export function pickText(en: string | undefined | null, ar: string | undefined | null, lang: Lang): string {
  const primary = lang === "ar" ? ar : en;
  const fallback = lang === "ar" ? en : ar;
  return (primary?.trim() ? primary : fallback?.trim() ? fallback : "") ?? "";
}

/** Same idea for a section's JSON content blobs: pick ar/enContent by language, with a fallback. */
export function pickContent<T extends Record<string, unknown>>(
  enContent: T | undefined,
  arContent: T | undefined,
  lang: Lang,
): T {
  const primary = lang === "ar" ? arContent : enContent;
  const fallback = lang === "ar" ? enContent : arContent;
  return (primary && Object.keys(primary).length > 0 ? primary : fallback) ?? ({} as T);
}

export function dirFor(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}
