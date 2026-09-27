import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// TILLAGD 2026-09-27 (andra passet samma dag, se claude/velvetine-status.md)
// - alternativ till /api/store/checkout: löser in en ram/chattfärg/
// profilbakgrund med poäng istället för en riktig Stripe-betalning. Rör
// ALDRIG Stripe (precis som att skicka en present inte gör det), så det
// här fungerar även innan Stripe-nycklarna är på plats. DIGITAL_GIFT går
// inte att lösa in här - presenter köps aldrig separat, se
// src/app/api/matches/[matchId]/messages/route.ts.
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const storeItemId = typeof body?.storeItemId === "string" ? body.storeItemId : null;
  if (!storeItemId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const [item, alreadyOwned] = await Promise.all([
    prisma.storeItem.findUnique({ where: { id: storeItemId } }),
    prisma.userStoreItem.findUnique({
      where: { userId_storeItemId: { userId, storeItemId } },
    }),
  ]);

  if (!item || !item.active || item.category === "DIGITAL_GIFT" || item.creditCost == null) {
    return NextResponse.json({ error: "Den här varan går inte att lösa in med poäng." }, { status: 400 });
  }
  if (alreadyOwned) {
    return NextResponse.json({ error: "Du äger redan den här." }, { status: 400 });
  }

  const creditCost = item.creditCost;

  try {
    await prisma.$transaction(async (tx) => {
      const deducted = await tx.user.updateMany({
        where: { id: userId, giftCredits: { gte: creditCost } },
        data: { giftCredits: { decrement: creditCost } },
      });
      if (deducted.count === 0) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const updatedUser = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { giftCredits: true },
      });

      // Samma skydd som checkout/route.ts mot att äga samma vara två
      // gånger - unikt index på (userId, storeItemId) gör detta säkert
      // även om något annat anrop skulle hinna emellan.
      await tx.userStoreItem.create({ data: { userId, storeItemId } });

      await tx.giftCreditTransaction.create({
        data: {
          userId,
          type: "STORE_ITEM_REDEEMED",
          amount: -creditCost,
          balanceAfter: updatedUser.giftCredits,
          giftStoreItemId: storeItemId,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Du har inte tillräckligt med poäng för det här.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
