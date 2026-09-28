import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, destroySession } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// TILLAGD 2026-09-28 (Christoffer: "man ska kunna välja mellan att ha kvar
// saker eller inte" - vissa dejtingappar låter dig välja mellan att pausa
// och verkligen radera, se claude/velvetine-status.md). Ett självvalt,
// reversibelt ALTERNATIV till den permanenta raderingen i
// src/app/api/account/delete/route.ts - INGENTING raderas här: inga
// bilder, profilsvar, intressen, skrytprylar eller matchningar/meddelanden
// rörs alls. Kontot bara döljs (accountStatus: PAUSED - discovery-flödet
// i src/lib/discovery.ts kräver redan accountStatus: "ACTIVE" för att visas,
// ingen ändring behövdes där) och personen loggas ut.
//
// En eventuell prenumeration avslutas ändå (samma best-effort-mönster som
// raderingsflödet, och samma stående regel som gäller överallt: betalning
// ska aldrig fortsätta dras för ett konto som inte används) - webhooken
// (src/app/api/stripe/webhook/route.ts, "customer.subscription.deleted")
// uppdaterar subscriptionStatus/tierId automatiskt när Stripe bekräftar
// avbokningen, samma väg som en vanlig uppsägning redan går.
//
// Återaktivering sker automatiskt nästa gång personen loggar in med rätt
// lösenord - se src/app/api/auth/login/route.ts. Ingen admin behöver
// göra något, till skillnad från en admin-pålagd avstängning (SUSPENDED).
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  });

  if (user?.stripeSubscriptionId && isStripeConfigured() && stripe) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.error(
        "Kunde inte avbryta Stripe-prenumerationen vid pausning av konto.",
        err
      );
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: "PAUSED", pausedAt: new Date() },
  });

  await destroySession();

  return NextResponse.json({ ok: true });
}
