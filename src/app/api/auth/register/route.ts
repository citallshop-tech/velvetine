import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  createSession,
  generateEmailVerificationToken,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validation";
import { isOldEnough, MINIMUM_AGE } from "@/lib/age";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`register:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "För många registreringsförsök. Försök igen senare." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ogiltiga uppgifter" },
      { status: 400 }
    );
  }

  const { email, password, displayName, birthDate, gender, seekingGender } =
    parsed.data;
  // Hard gate, enforced server-side regardless of what the client sent -
  // never trust a client-side date picker's min-date restriction alone.
  if (!isOldEnough(birthDate)) {
    return NextResponse.json(
      { error: `Du måste vara minst ${MINIMUM_AGE} år för att skapa ett konto.` },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Det finns redan ett konto med den e-postadressen." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      birthDate,
      gender,
      seekingGender,
      specialCategoryConsentAt: new Date(),
    },
  });

  await createSession(user.id);

  const { rawToken, tokenHash } = generateEmailVerificationToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    },
  });
  const verifyUrl = `${request.nextUrl.origin}/verify-email?token=${rawToken}`;
  await sendVerificationEmail(user.email, verifyUrl);

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
