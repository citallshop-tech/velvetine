import { setClientCookie, readClientCookie } from "@/lib/clientCookie";

const VISITOR_COOKIE = "velvetine_visitor_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Creates the visitor cookie if it doesn't exist yet, returns its value either way. */
export function ensureVisitorId(): string {
  const existing = readClientCookie(VISITOR_COOKIE);
  if (existing) return existing;

  const id = crypto.randomUUID();
  setClientCookie(VISITOR_COOKIE, id, ONE_YEAR);
  return id;
}

/** Removes the visitor cookie - called when analytics consent is turned off. */
export function clearVisitorId() {
  setClientCookie(VISITOR_COOKIE, "", 0);
}
