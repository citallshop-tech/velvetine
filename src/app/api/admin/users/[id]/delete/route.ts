import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { stripe, isStripeConfigured } from "@/lib/stripe";

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

  // Same soft-delete pattern as self-service deletion in the dashboard:
  // scrub personal fields, keep the row so matches/messages/reports that
  // reference this id don't break for the other people involved.
  await prisma.user.update({
    where: { id },
    data: {
      accountStatus: "DELETED",
      deletedAt: new Date(),
      email: `deleted-${id}@velvetine.invalid`,
      displayName: "Borttaget konto",
      bio: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "NONE",
    },
  });

  return NextResponse.json({ ok: true });
}
