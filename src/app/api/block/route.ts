import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : null;

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } },
    create: { blockerId: userId, blockedId: targetUserId },
    update: {},
  });

  // Blocking closes any open conversation between the two people too -
  // a block that still leaves an active chat open defeats the point.
  const [userAId, userBId] = [userId, targetUserId].sort();
  await prisma.match.updateMany({
    where: { userAId, userBId, status: "ACTIVE" },
    data: { status: "UNMATCHED" },
  });

  return NextResponse.json({ ok: true });
}
