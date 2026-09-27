import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { BOOST_DURATION_MS } from "../route";

// TILLAGD 2026-09-27 (se claude/velvetine-status.md) - en poäng-köpt boost,
// separat endpoint från den gratis nivå-boosten i ../route.ts. Öppen för
// ALLA nivåer (ingen MIN_TIER_LEVEL_FOR_BOOST-kontroll här - att betala med
// poäng är själva poängen med att inte ha rätt nivå än) och har INGEN
// dygns-cooldown - bara att man inte redan är boostad just nu. Christoffer
// kan när som helst ändra priset här om det visar sig fel.
const BOOST_CREDIT_COST = 39;

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const now = new Date();

  try {
    const boostedUntil = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { boostedUntil: true },
      });

      // Redan boostad just nu (oavsett om det var en gratis- eller en
      // poäng-boost som satte det) - ingen anledning att kunna stapla dem.
      if (user.boostedUntil && user.boostedUntil > now) {
        throw new Error("ALREADY_BOOSTED");
      }

      const deducted = await tx.user.updateMany({
        where: { id: userId, giftCredits: { gte: BOOST_CREDIT_COST } },
        data: { giftCredits: { decrement: BOOST_CREDIT_COST } },
      });
      if (deducted.count === 0) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      const updatedUser = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { giftCredits: true },
      });

      const newBoostedUntil = new Date(now.getTime() + BOOST_DURATION_MS);
      await tx.user.update({ where: { id: userId }, data: { boostedUntil: newBoostedUntil } });

      await tx.giftCreditTransaction.create({
        data: {
          userId,
          type: "BOOST_PURCHASED",
          amount: -BOOST_CREDIT_COST,
          balanceAfter: updatedUser.giftCredits,
        },
      });

      return newBoostedUntil;
    });

    return NextResponse.json({ ok: true, boostedUntil });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_BOOSTED") {
      return NextResponse.json({ error: "Du är redan boostad just nu." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Du har inte tillräckligt med poäng för att boosta.", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }
    throw err;
  }
}
