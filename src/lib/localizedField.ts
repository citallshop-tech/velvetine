/**
 * For fixed, business-configured DB content (tier names, prompt
 * questions, store item names) that has optional per-language columns
 * alongside the Swedish original. Not for user-generated content (bios,
 * messages) - that's a different problem needing a real translation API,
 * not extra columns.
 *
 * TILLAGD 2026-09-21 - de/es utökade utöver den ursprungliga sv/en-
 * versionen (se claude/velvetine-status.md). de/es är valfria parametrar
 * så äldre anrop med bara (locale, sv, en) fortfarande fungerar oförändrat.
 * Faller tillbaka till svenska om det efterfrågade språkets kolumn är tom -
 * samma beteende som redan gällde för engelska.
 */
export function pickLocalized(
  locale: string,
  sv: string,
  en: string | null,
  de?: string | null,
  es?: string | null
): string {
  if (locale === "en" && en) return en;
  if (locale === "de" && de) return de;
  if (locale === "es" && es) return es;
  return sv;
}

// TILLAGT 2026-09-21 - de/es-stöd. Maps a UI locale code to the BCP-47 tag
// Intl.NumberFormat/DateTimeFormat expect, for correct thousands/decimal
// separators per language (t.ex. "1.234,56" på tyska mot "1,234.56" på
// engelska). Falls back to Swedish for any locale not listed, same as the
// rest of the app's default.
const INTL_TAGS: Record<string, string> = {
  sv: "sv-SE",
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
};

export function localeToIntlTag(locale: string): string {
  return INTL_TAGS[locale] ?? "sv-SE";
}
