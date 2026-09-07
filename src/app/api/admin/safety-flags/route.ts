import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const flagId = typeof body.flagId === "string" ? body.flagId : null;
  if (!flagId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  await prisma.safetyFlag.update({
    where: { id: flagId },
    data: { reviewedAt: new Date(), reviewedBy: admin.email },
  });

  return NextResponse.json({ ok: true });
}
