import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { deleteImage } from "@/lib/imageUpload";

export async function DELETE(
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

  await prisma.photo.delete({ where: { id } });
  await deleteImage(photo.url);

  // If the deleted photo was primary, promote the next remaining one
  // (if any) so there's always a primary photo when photos exist.
  if (photo.isPrimary) {
    const next = await prisma.photo.findFirst({
      where: { userId },
      orderBy: { order: "asc" },
    });
    if (next) {
      await prisma.photo.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  return NextResponse.json({ ok: true });
}
