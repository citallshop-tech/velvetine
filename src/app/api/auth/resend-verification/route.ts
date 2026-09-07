import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  generateEmailVerificationToken,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

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

  return NextResponse.json({ ok: true });
}
