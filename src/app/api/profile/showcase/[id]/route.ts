import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.showcaseItem.findUnique({ where: { id } });
  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  await prisma.showcaseItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
