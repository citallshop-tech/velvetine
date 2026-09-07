import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "velvetine_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to .env before starting the server."
    );
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export interface SessionPayload {
  userId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie on the response for the current request.
 * Call from a Route Handler or Server Action, not a Server Component
 * (Next.js only allows writing cookies in those contexts).
 */
export async function createSession(userId: string): Promise<void> {
  const token = signSessionToken({ userId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Reads the session cookie in the current request context and returns the
 * logged-in user id, or null if there is none / it's invalid or expired.
 * Safe to call from Server Components (read-only).
 */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  return payload?.userId ?? null;
}

const RESET_TOKEN_BYTES = 32;
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generates a password reset token. Returns both the raw token (put this
 * in the email link, never store it) and its hash (store this in the DB).
 * Hashing what we store means a leaked database doesn't hand out working
 * reset links, same reasoning as never storing plaintext passwords.
 */
export function generatePasswordResetToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Same approach as generatePasswordResetToken() - a verification link
 * isn't as time-sensitive as a password reset, so it gets a longer
 * window (24h vs 1h) before it expires.
 */
export function generateEmailVerificationToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  return { rawToken, tokenHash };
}