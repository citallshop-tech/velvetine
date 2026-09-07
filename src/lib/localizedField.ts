/**
 * For fixed, business-configured DB content (tier names, prompt
 * questions) that has an optional English variant column alongside the
 * Swedish original. Not for user-generated content (bios, messages) -
 * that's a different problem needing a real translation API, not a
 * second column.
 */
export function pickLocalized(locale: string, sv: string, en: string | null): string {
  return locale === "en" && en ? en : sv;
}
