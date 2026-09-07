import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";
import { sendNewMatchEmail } from "@/lib/email";

// Förstklassig ("Premier") and up - the "exclusive club" perk: reach out
// directly instead of waiting for a mutual like, matching the tier's
// application-gated, hand-picked positioning.
const MIN_TIER_LEVEL_FOR_MESSAGE_FIRST = 4;

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : null;
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 2000) : "";

  if (!targetUserId || targetUserId === userId || !content) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { tier: true } });
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }
  if ((user.tier?.level ?? 0) < MIN_TIER_LEVEL_FOR_MESSAGE_FIRST) {
    return NextResponse.json({ error: "Kräver nivå Förstklassig eller högre." }, { status: 403 });
  }

  const [blockedByMe, blockingMe] = await Promise.all([
    prisma.block.findFirst({ where: { blockerId: userId, blockedId: targetUserId } }),
    prisma.block.findFirst({ where: { blockerId: targetUserId, blockedId: userId } }),
  ]);
  if (blockedByMe || blockingMe) {
    return NextResponse.json({ error: "Kan inte kontakta den här personen." }, { status: 403 });
  }

  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId } },
    create: { fromUserId: userId, toUserId: targetUserId, direction: "LIKE" },
    update: { direction: "LIKE" },
  });

  // Same sorted-id convention as the regular mutual-match flow, so this
  // can never produce a duplicate Match row for the same pair.
  const [userAId, userBId] = [userId, targetUserId].sort();
  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  const message = await prisma.message.create({
    data: { matchId: match.id, senderId: userId, content },
  });

  const isUserA = match.userAId === userId;
  await prisma.match.update({
    where: { id: match.id },
    data: isUserA ? { lastReadByA: new Date() } : { lastReadByB: new Date() },
  });

  const sender = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });
  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { email: true } });

  void sendPushToUser(targetUserId, {
    title: sender?.displayName ?? "Nytt meddelande",
    body: content.slice(0, 100),
    url: `/matches/${match.id}`,
  });
  if (target) {
    const matchUrl = `${request.nextUrl.origin}/sv/matches/${match.id}`;
    void sendNewMatchEmail(target.email, matchUrl);
  }

  return NextResponse.json({ ok: true, matchId: match.id, messageId: message.id });
}
