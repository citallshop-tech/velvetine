import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Vercel (and most proxies) set x-forwarded-for to a comma-separated
 * list of IPs, client's real IP first. Falls back to a constant when
 * running somewhere that doesn't set it (e.g. some local setups) -
 * rate limiting by a shared fallback key isn't perfect, but it's still
 * better than not rate limiting at all.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Sliding-window rate limit: allows at most `maxAttempts` recorded
 * attempts under `key` within the last `windowMs`. Call this BEFORE the
 * action it's protecting - it records the attempt as part of the check,
 * so a blocked attempt doesn't also count as a fresh one.
 *
 * Opportunistically deletes old rows for this key past the window while
 * it's already querying, so the table doesn't grow unbounded without
 * needing a separate cleanup job.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs);

  const [count] = await Promise.all([
    prisma.rateLimitAttempt.count({ where: { key, createdAt: { gte: windowStart } } }),
    prisma.rateLimitAttempt.deleteMany({ where: { key, createdAt: { lt: windowStart } } }),
  ]);

  if (count >= maxAttempts) {
    const oldest = await prisma.rateLimitAttempt.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterMs = oldest ? oldest.createdAt.getTime() + windowMs - Date.now() : windowMs;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  await prisma.rateLimitAttempt.create({ data: { key } });
  return { allowed: true };
}
