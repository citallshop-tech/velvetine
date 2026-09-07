import { setClientCookie, readClientCookie } from "@/lib/clientCookie";

const ANALYTICS_COOKIE = "velvetine_analytics_consent";

export function getAnalyticsConsent(): boolean {
  const value = readClientCookie(ANALYTICS_COOKIE);
  // Opt-in, not opt-out: this now backs a real persistent visitor cookie
  // (see visitorCookie.ts), so nothing gets tracked until the person has
  // explicitly turned it on - no cookie is set before that choice exists.
  if (value === null) return false;
  return value === "1";
}

export function setAnalyticsConsent(enabled: boolean) {
  const oneYear = 60 * 60 * 24 * 365;
  setClientCookie(ANALYTICS_COOKIE, enabled ? "1" : "0", oneYear);
}
