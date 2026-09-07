import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ogiltig länk." }, { status: 400 });
  }

  const { token } = parsed.data;
  const tokenHash = hashResetToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  const invalid =
    !verificationToken ||
    verificationToken.usedAt !== null ||
    verificationToken.expiresAt < new Date();

  if (invalid) {
    return NextResponse.json(
      { error: "Länken är ogiltig eller har gått ut. Begär en ny." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
