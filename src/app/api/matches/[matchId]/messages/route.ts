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
  // TILLAGD 2026-09-21 - digitala presenter (se claude/velvetine-status.md).
  // Ett meddelande är antingen text, bild eller present - aldrig flera på
  // en gång, precis som imageUrl redan var separat från content.
  const giftStoreItemId = typeof body.giftStoreItemId === "string" ? body.giftStoreItemId : null;
  // TILLAGD 2026-09-27 (andra passet samma dag, se claude/velvetine-status.md)
  // - "lyft"/markera ett VANLIGT meddelande för poäng. Gäller aldrig en
  // gåva - den är redan visuellt utmärkande i chatten, så vi ignorerar
  // flaggan tyst istället för att svara med ett fel (klienten erbjuder den
  // aldrig samtidigt som en gåva, se ChatThread.tsx).
  const wantsHighlight = !giftStoreItemId && body.highlight === true;
  // Måste matcha samma konstant i src/components/ChatThread.tsx.
  const MESSAGE_HIGHLIGHT_CREDIT_COST = 10;

  if (!content && !imageUrl && !giftStoreItemId) {
    return NextResponse.json({ error: "Tomt meddelande." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== userId && match.userBId !== userId)) {
    return NextResponse.json({ error: "Hittades inte." }, { status: 404 });
  }
  if (match.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konversationen är inte längre aktiv." }, { status: 400 });
  }

  // ÄNDRAD 2026-09-27 (se claude/velvetine-status.md): en present ägs INTE
  // längre - Christoffer var uttrycklig om att den ska kosta poäng VARJE
  // gång man skickar den, inte köpas en gång och sen vara gratis för
  // alltid. Poängen dras av atomärt i samma databastransaktion som
  // meddelandet skapas (prisma.$transaction nedan), med ett villkorat
  // updateMany (giftCredits >= creditCost) som skydd mot att två samtidiga
  // "skicka present"-klick skulle kunna dra saldot under noll.
  // ÄNDRAD 2026-09-27 (andra passet) - generaliserad till att även täcka
  // wantsHighlight (se ovan). De två är ömsesidigt uteslutande (highlight
  // stängs av helt så fort giftStoreItemId finns), så det blir aldrig mer
  // än EN poäng-transaktionsrad per meddelande - GiftCreditTransaction.
  // messageId förblir därför unikt precis som innan.
  let creditCost = 0;
  if (giftStoreItemId) {
    const giftItem = await prisma.storeItem.findUnique({ where: { id: giftStoreItemId } });
    if (!giftItem || giftItem.category !== "DIGITAL_GIFT" || !giftItem.active) {
      return NextResponse.json({ error: "Den här presenten går inte att skicka just nu." }, { status: 400 });
    }
    creditCost = giftItem.creditCost ?? 0;
  } else if (wantsHighlight) {
    creditCost = MESSAGE_HIGHLIGHT_CREDIT_COST;
  }

  let message;
  if (creditCost > 0) {
    try {
      message = await prisma.$transaction(async (tx) => {
        const deducted = await tx.user.updateMany({
          where: { id: userId, giftCredits: { gte: creditCost } },
          data: { giftCredits: { decrement: creditCost } },
        });
        if (deducted.count === 0) {
          // Signalvärde, fångas nedan - inte ett riktigt undantag i
          // meningen "något gick fel", bara "för lågt saldo".
          throw new Error("INSUFFICIENT_CREDITS");
        }

        const updatedUser = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { giftCredits: true },
        });

        const created = await tx.message.create({
          data: {
            matchId,
            senderId: userId,
            content: content || null,
            imageUrl,
            giftStoreItemId,
            highlighted: wantsHighlight,
          },
          include: { giftStoreItem: { select: { giftEmoji: true } } },
        });

        await tx.giftCreditTransaction.create({
          data: {
            userId,
            type: giftStoreItemId ? "GIFT_SENT" : "MESSAGE_HIGHLIGHTED",
            amount: -creditCost,
            balanceAfter: updatedUser.giftCredits,
            giftStoreItemId,
            messageId: created.id,
          },
        });

        return created;
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          {
            error: giftStoreItemId
              ? "Du har inte tillräckligt med poäng för att skicka den här presenten."
              : "Du har inte tillräckligt med poäng för att lyfta meddelandet.",
            code: "INSUFFICIENT_CREDITS",
          },
          { status: 402 }
        );
      }
      throw err;
    }
  } else {
    message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        content: content || null,
        imageUrl,
        giftStoreItemId: null,
        highlighted: false,
      },
      include: { giftStoreItem: { select: { giftEmoji: true } } },
    });
  }

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
    body: content
      ? content.slice(0, 100)
      : message.giftStoreItem
        ? `${message.giftStoreItem.giftEmoji ?? "🎁"} Skickade en present`
        : "📷 Skickade en bild",
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
      giftEmoji: message.giftStoreItem?.giftEmoji ?? null,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
      highlighted: message.highlighted,
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
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { giftStoreItem: { select: { giftEmoji: true } } },
      },
    },
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
      giftEmoji: m.giftStoreItem?.giftEmoji ?? null,
      senderId: m.senderId,
      createdAt: m.createdAt.toISOString(),
      highlighted: m.highlighted,
    })),
    otherLastReadAt: otherLastReadAt?.toISOString() ?? null,
    isActive: match.status === "ACTIVE",
  });
}
