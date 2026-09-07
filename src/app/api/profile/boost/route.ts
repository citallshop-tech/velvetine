import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// Utvald ("Select") and up - an active perk you use, distinct from the
// passive priority-visibility boost every tier already gets.
const MIN_TIER_LEVEL_FOR_BOOST = 2;
const BOOST_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // once per day

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tier: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  if ((user.tier?.level ?? 0) < MIN_TIER_LEVEL_FOR_BOOST) {
    return NextResponse.json({ error: "Kräver nivå Utvald eller högre." }, { status: 403 });
  }

  const now = new Date();

  // Still actively boosted right now.
  if (user.boostedUntil && user.boostedUntil > now) {
    return NextResponse.json(
      { error: "Du är redan boostad just nu.", boostedUntil: user.boostedUntil },
      { status: 400 }
    );
  }

  // On cooldown - boostedUntil (even though expired) tells us when the
  // last boost ended, which is when the cooldown started counting.
  if (user.boostedUntil) {
    const cooldownEndsAt = new Date(user.boostedUntil.getTime() + COOLDOWN_MS - BOOST_DURATION_MS);
    if (cooldownEndsAt > now) {
      return NextResponse.json(
        {
          error: "Du kan boosta igen senare - en gång per dygn.",
          cooldownEndsAt,
        },
        { status: 400 }
      );
    }
  }

  const boostedUntil = new Date(now.getTime() + BOOST_DURATION_MS);
  await prisma.user.update({ where: { id: userId }, data: { boostedUntil } });

  return NextResponse.json({ ok: true, boostedUntil });
}
