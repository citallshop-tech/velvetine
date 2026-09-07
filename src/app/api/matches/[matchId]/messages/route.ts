import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";
import { sendNewMessageEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const { matchId } = await params;
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 2000) : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;

  if (!content && !imageUrl) {
    return NextResponse.json({ error: "Tomt meddelande." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== userId && match.userBId !== userId)) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }
  if (match.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konversationen är inte längre aktiv." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { matchId, senderId: userId, content: content || null, imageUrl },
  });

  const isUserA = match.userAId === userId;
  await prisma.match.update({
    where: { id: matchId },
    data: isUserA ? { lastReadByA: new Date() } : { lastReadByB: new Date() },
  });

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });
  const recipientId = isUserA ? match.userBId : match.userAId;

  void sendPushToUser(recipientId, {
    title: sender?.displayName ?? "Nytt meddelande",
    body: content ? content.slice(0, 100) : "📷 Skickade en bild",
    url: `/matches/${matchId}`,
  });

  // Only email if this is the first unread message since the recipient
  // last checked - otherwise an active back-and-forth chat would send
  // one email per message, which is exactly the kind of spam this
  // heuristic exists to avoid.
  const recipientLastRead = isUserA ? match.lastReadByB : match.lastReadByA;
  const priorUnread = await prisma.message.findFirst({
    where: {
      matchId,
      senderId: userId,
      id: { not: message.id },
      createdAt: recipientLastRead ? { gt: recipientLastRead } : undefined,
    },
    select: { id: true },
  });

  if (!priorUnread) {
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { email: true },
    });
    if (recipient) {
      const matchUrl = `${request.nextUrl.origin}/sv/matches/${matchId}`;
      void sendNewMessageEmail(recipient.email, sender?.displayName ?? "Någon", matchUrl);
    }
  }

  return NextResponse.json({
    message: {
      id: message.id,
      content: message.content,
      imageUrl: message.imageUrl,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
    },
  });
}

/**
 * Polling endpoint for the chat thread - the client calls this every
 * few seconds instead of requiring a manual refresh. Returns the full
 * message list plus the other person's read timestamp, so the client
 * can update both new messages and read receipts in one call.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!match || (match.userAId !== userId && match.userBId !== userId)) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }

  const isUserA = match.userAId === userId;
  const otherLastReadAt = isUserA ? match.lastReadByB : match.lastReadByA;

  // Polling implies actively viewing the thread right now - keep read
  // receipts accurate for messages that arrive while the chat stays
  // open, not just the ones present at initial page load.
  await prisma.match.update({
    where: { id: matchId },
    data: isUserA ? { lastReadByA: new Date() } : { lastReadByB: new Date() },
  });

  return NextResponse.json({
    messages: match.messages.map((m) => ({
      id: m.id,
      content: m.content,
      imageUrl: m.imageUrl,
      senderId: m.senderId,
      createdAt: m.createdAt.toISOString(),
    })),
    otherLastReadAt: otherLastReadAt?.toISOString() ?? null,
    isActive: match.status === "ACTIVE",
  });
}
