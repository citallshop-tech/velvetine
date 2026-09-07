/**
 * What a cookie actually needs to be complete and safe:
 * - name=value: the data itself
 * - path: which routes it's sent on (we always use "/" - the whole site)
 * - max-age: how long it lives (0 deletes it immediately)
 * - SameSite=Lax: sent on normal navigation, blocked on cross-site
 *   requests that aren't simple GETs - blocks basic CSRF vectors
 * - Secure: only ever sent over HTTPS - required in production, would
 *   block the cookie entirely on plain http://localhost in dev, hence
 *   the location.protocol check rather than hardcoding it on
 *
 * (HttpOnly can't be set from client-side JS at all - that one only
 * applies to the session cookie, set server-side in auth.ts, since
 * these three all need to be readable by the browser itself.)
 */
export function setClientCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`;
}

export function readClientCookie(name: string): string | null {
  const row = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  return row ? row.split("=")[1] : null;
}
