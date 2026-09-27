import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, destroySession } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { deleteAccount } from "@/lib/accountDeletion";

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

  // RÄTTAD 2026-09-27 (se claude/velvetine-status.md) - raderade tidigare
  // bara namn/e-post/bio, trots att Villkoren lovar att bilder,
  // profilfrågor, intressen, skrytprylar och verifieringsselfie tas bort
  // permanent. deleteAccount() gör nu det på riktigt (utom om en olöst
  // rapport/säkerhetsflagga finns mot personen - se
  // src/lib/accountDeletion.ts för hela resonemanget).
  await deleteAccount(userId);

  await destroySession();

  return NextResponse.json({ ok: true });
}
