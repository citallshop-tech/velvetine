import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const { id } = await params;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || photo.userId !== userId) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.photo.updateMany({ where: { userId }, data: { isPrimary: false } }),
    prisma.photo.update({ where: { id }, data: { isPrimary: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
