import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, destroySession } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  // TILLAGT 2026-09-26 (Christoffer: betalning MÅSTE avbrytas för alla som
  // avslutar sitt konto - stående regel för alla plattformar, inte bara
  // Velvetine). Görs FÖRST, innan kontot skrivs över nedan - annars finns
  // ett fönster där ett redan "borttaget" konto ändå fortsätter debiteras.
  // Best-effort: en Stripe-nätverksfel ska aldrig hindra någon från att
  // faktiskt kunna avsluta sitt konto, men loggas tydligt om det händer.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  });

  if (user?.stripeSubscriptionId && isStripeConfigured() && stripe) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.error(
        "Kunde inte avbryta Stripe-prenumerationen vid kontoradering.",
        err
      );
    }
  }

  // Soft-delete: mark as deleted and scrub personal fields, rather than a
  // hard row delete. Matches/messages/reports reference this user id, and
  // keeping the row (with content scrubbed) avoids either cascading deletes
  // through someone else's match history or leaving dangling references.
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: "DELETED",
      deletedAt: new Date(),
      email: `deleted-${userId}@velvetine.invalid`,
      displayName: "Borttaget konto",
      bio: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "NONE",
    },
  });

  await destroySession();

  return NextResponse.json({ ok: true });
}
