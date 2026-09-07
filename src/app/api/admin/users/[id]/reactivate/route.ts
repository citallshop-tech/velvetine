import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const { id } = await params;

  await prisma.user.update({
    where: { id },
    data: { accountStatus: "ACTIVE", suspendedUntil: null },
  });

  return NextResponse.json({ ok: true });
}
