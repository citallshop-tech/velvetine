import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const storeItemId = typeof body?.storeItemId === "string" ? body.storeItemId : null;

  // Unequip - allowed regardless of ownership, always reverts to the
  // default tier-based frame.
  if (!storeItemId) {
    await prisma.user.update({ where: { id: userId }, data: { equippedFrameId: null } });
    return NextResponse.json({ ok: true });
  }

  const owned = await prisma.userStoreItem.findUnique({
    where: { userId_storeItemId: { userId, storeItemId } },
  });
  if (!owned) {
    return NextResponse.json({ error: "Du äger inte den här." }, { status: 403 });
  }

  await prisma.user.update({ where: { id: userId }, data: { equippedFrameId: storeItemId } });
  return NextResponse.json({ ok: true });
}
