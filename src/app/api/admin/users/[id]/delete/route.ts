import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { deleteAccount } from "@/lib/accountDeletion";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Inte behörig." }, { status: 403 });
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      { error: "Kan inte radera ditt eget konto härifrån." },
      { status: 400 }
    );
  }

  // TILLAGT 2026-09-26 - samma stående regel som självbetjänings-raderingen
  // (src/app/api/account/delete/route.ts): betalning ska ALLTID avbrytas
  // när ett konto tas bort, oavsett om det är användaren själv eller en
  // admin som gör det.
  const user = await prisma.user.findUnique({
    where: { id },
    select: { stripeSubscriptionId: true },
  });

  if (user?.stripeSubscriptionId && isStripeConfigured() && stripe) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.error(
        "Kunde inte avbryta Stripe-prenumerationen vid admin-radering.",
        err
      );
    }
  }

  // RÄTTAD 2026-09-27 (se claude/velvetine-status.md) - använder nu samma
  // delade deleteAccount()-funktion som självbetjänings-raderingen, som
  // faktiskt raderar bilder/profilfrågor/intressen/skrytprylar/
  // verifieringsselfie (utom vid en pågående utredning) - de två raderna
  // hade tidigare varsin kopia av bara fält-rensningen, vilket är precis
  // hur den luckan uppstod (Stripe-avbrytningen lades bara till på båda
  // ställen för sig, den riktiga raderingen aldrig på något av dem).
  await deleteAccount(id);

  return NextResponse.json({ ok: true });
}
