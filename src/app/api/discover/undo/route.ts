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

  await prisma.swipe.deleteMany({
    where: { fromUserId: userId, toUserId: targetUserId },
  });

  // If that swipe had just created a match and nobody has said anything
  // yet, undo the match too - a rewind should cleanly reverse a like, not
  // leave a half-formed conversation. If messages already exist, leave
  // the match alone; a real conversation started, so this isn't really
  // "undo-able" anymore.
  const [userAId, userBId] = [userId, targetUserId].sort();
  const match = await prisma.match.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    include: { _count: { select: { messages: true } } },
  });

  if (match && match.status === "ACTIVE" && match._count.messages === 0) {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: "UNMATCHED" },
    });
  }

  return NextResponse.json({ ok: true });
}
