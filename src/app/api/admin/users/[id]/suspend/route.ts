import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const days = typeof body.days === "number" && body.days > 0 ? body.days : 7;

  const suspendedUntil = new Date();
  suspendedUntil.setDate(suspendedUntil.getDate() + days);

  await prisma.user.update({
    where: { id },
    data: { accountStatus: "SUSPENDED", suspendedUntil },
  });

  return NextResponse.json({ ok: true, suspendedUntil });
}
