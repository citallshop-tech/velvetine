import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

// Always the same message, whether or not the email exists - a different
// response for "no account" vs "email sent" is exactly how account
// enumeration attacks find out which addresses are registered.
const GENERIC_MESSAGE =
  "Om det finns ett konto med den e-postadressen har vi skickat en återställningslänk.";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`forgot-password:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    // Same generic message even when rate limited - no need to reveal
    // the rate limiting mechanism itself to a potential abuser.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ogiltig e-postadress" }, { status: 400 });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.accountStatus === "ACTIVE") {
    const { rawToken, tokenHash } = generatePasswordResetToken();

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${request.nextUrl.origin}/sv/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
