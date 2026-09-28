import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { reactivateIfExpired } from "@/lib/suspension";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "För många inloggningsförsök. Försök igen om en stund." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ogiltiga uppgifter" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  let user = await prisma.user.findUnique({ where: { email } });

  // Same error for "no such user" and "wrong password" - don't reveal
  // which one it was, that leaks whether an email is registered.
  const genericError = { error: "Fel e-postadress eller lösenord." };

  if (!user) {
    return NextResponse.json(genericError, { status: 401 });
  }

  user = await reactivateIfExpired(user);

  if (user.accountStatus === "SUSPENDED") {
    const until = user.suspendedUntil
      ? ` till ${user.suspendedUntil.toLocaleDateString("sv-SE")}`
      : "";
    return NextResponse.json(
      { error: `Det här kontot är avstängt${until}. Kontakta support för hjälp.` },
      { status: 403 }
    );
  }

  if (user.accountStatus === "BANNED") {
    return NextResponse.json(
      { error: "Det här kontot är permanent avstängt." },
      { status: 403 }
    );
  }

  if (user.accountStatus === "DELETED") {
    return NextResponse.json(genericError, { status: 401 });
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(genericError, { status: 401 });
  }

  // TILLAGD 2026-09-28 (se claude/velvetine-status.md och
  // src/app/api/account/pause/route.ts) - ett PAUSED-konto (självvalt,
  // reversibelt, till skillnad från SUSPENDED ovan) återaktiveras här
  // automatiskt så fort rätt lösenord angetts - ingen admin, inget
  // separat "återaktivera"-steg behövs. Görs EFTER lösenordskontrollen
  // (till skillnad från SUSPENDED/BANNED-blocken ovan) så att ingen kan
  // gissa sig till att ett konto är pausat utan att faktiskt känna till
  // lösenordet.
  if (user.accountStatus === "PAUSED") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { accountStatus: "ACTIVE", pausedAt: null },
    });
  }

  await createSession(user.id);

  return NextResponse.json({ id: user.id, email: user.email });
}
