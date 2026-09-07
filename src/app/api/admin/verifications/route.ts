import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const selfieId = typeof body.selfieId === "string" ? body.selfieId : null;
  const approve = body.approve === true;

  if (!selfieId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const selfie = await prisma.verificationSelfie.findUnique({ where: { id: selfieId } });
  if (!selfie) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.verificationSelfie.update({
      where: { id: selfieId },
      data: { status: approve ? "VERIFIED" : "FAILED", reviewedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: selfie.userId },
      data: { verified: approve },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
