import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: "Betalning är inte konfigurerad ännu." }, { status: 503 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const tierId = typeof body?.tierId === "string" ? body.tierId : null;
  if (!tierId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const [user, tier] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.tier.findUnique({ where: { id: tierId } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }
  if (!tier || !tier.stripePriceId) {
    return NextResponse.json(
      { error: "Den här nivån går inte att köpa just nu." },
      { status: 400 }
    );
  }

  // Applications-only tiers still go through checkout, but only after
  // approval - the applications queue is the gate, not this route.
  if (tier.requiresApplication) {
    const approvedApplication = await prisma.tierApplication.findFirst({
      where: { userId, tierId, status: "APPROVED" },
    });
    if (!approvedApplication) {
      return NextResponse.json(
        { error: "Den här nivån kräver en godkänd ansökan innan du kan betala." },
        { status: 403 }
      );
    }
  }

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
  }

  // Already has an active subscription - update that same subscription's
  // price instead of starting a second one, so only one plan is ever
  // being billed at a time. Stripe prorates the difference automatically.
  if (user.stripeSubscriptionId && user.subscriptionStatus === "ACTIVE") {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const currentItem = subscription.items.data[0];

    if (!currentItem) {
      return NextResponse.json(
        { error: "Kunde inte hitta din befintliga prenumeration." },
        { status: 500 }
      );
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ id: currentItem.id, price: tier.stripePriceId }],
      proration_behavior: "create_prorations",
      metadata: { userId: user.id, tierId: tier.id },
    });

    // Optimistic update for a snappy UI - the webhook (subscription.updated)
    // will fire from the change above too and reconciles this as the
    // ultimate source of truth either way.
    await prisma.user.update({ where: { id: userId }, data: { tierId: tier.id } });

    return NextResponse.json({ ok: true, switched: true });
  }

  const origin = request.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: tier.stripePriceId, quantity: 1 }],
    success_url: `${origin}/sv/dashboard?upgraded=1`,
    cancel_url: `${origin}/sv/dashboard`,
    metadata: { userId: user.id, tierId: tier.id },
    subscription_data: {
      metadata: { userId: user.id, tierId: tier.id },
    },
    // Determines the customer's country from their billing address
    // (validated against card data per EU rules) and calculates the
    // right VAT/sales tax automatically - this is what answers "which
    // country did this customer buy from" for tax reporting. Requires
    // tax registrations to be set up in the Stripe Dashboard for this
    // to actually collect tax anywhere - that part's a dashboard/business
    // step, not something this code can do.
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
  });

  return NextResponse.json({ url: session.url });
}
