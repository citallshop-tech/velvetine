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
  const tierId = typeof body.tierId === "string" && body.tierId.length > 0 ? body.tierId : null;

  if (tierId) {
    const tier = await prisma.tier.findUnique({ where: { id: tierId } });
    if (!tier) {
      return NextResponse.json({ error: "Nivån hittades inte." }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id },
    data: { tierId },
  });

  return NextResponse.json({ ok: true });
}
