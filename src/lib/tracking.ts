import { createHash } from "crypto";
import { NextRequest } from "next/server";

/**
 * Produces a hash that's stable for the same visitor across the same
 * calendar day, and different the next day. Good enough to dedupe "unique
 * visitors" per day without keeping anything that identifies a specific
 * person past 24 hours - no cookie, no stored IP, nothing to hand over if
 * asked "who visited on this date". Deliberately not a persistent
 * identifier: that's what would trigger a cookie-consent requirement.
 */
export function getVisitorHash(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const salt = process.env.JWT_SECRET ?? "noctura";

  return createHash("sha256").update(`${ip}:${userAgent}:${today}:${salt}`).digest("hex");
}
