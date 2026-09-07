import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";
import { sendNewMatchEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : null;
  const direction = body.direction === "LIKE" ? "LIKE" : "PASS";

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId } },
    create: { fromUserId: userId, toUserId: targetUserId, direction },
    update: { direction },
  });

  let matched = false;
  let matchId: string | null = null;

  if (direction === "LIKE") {
    const reciprocal = await prisma.swipe.findUnique({
      where: { fromUserId_toUserId: { fromUserId: targetUserId, toUserId: userId } },
    });

    if (reciprocal?.direction === "LIKE") {
      // Order the pair consistently (sorted ids) so the same two people
      // can never end up with two Match rows in opposite order.
      const [userAId, userBId] = [userId, targetUserId].sort();
      const match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: { userAId, userBId },
        update: {},
      });
      matched = true;
      matchId = match.id;

      // Fire-and-forget - a failed push should never block the swipe
      // response the person is actively waiting on.
      void sendPushToUser(userId, {
        title: "Ny matchning!",
        body: "Ni gillade varandra på Velvetine.",
        url: `/matches/${match.id}`,
      });
      void sendPushToUser(targetUserId, {
        title: "Ny matchning!",
        body: "Ni gillade varandra på Velvetine.",
        url: `/matches/${match.id}`,
      });

      const [me, them] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
        prisma.user.findUnique({ where: { id: targetUserId }, select: { email: true } }),
      ]);
      const matchUrl = `${request.nextUrl.origin}/sv/matches/${match.id}`;
      if (me) void sendNewMatchEmail(me.email, matchUrl);
      if (them) void sendNewMatchEmail(them.email, matchUrl);
    }
  }

  return NextResponse.json({ ok: true, matched, matchId });
}
