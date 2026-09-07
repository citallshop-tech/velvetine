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
  const storeItemId = typeof body?.storeItemId === "string" ? body.storeItemId : null;
  if (!storeItemId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const [user, item, alreadyOwned] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.storeItem.findUnique({ where: { id: storeItemId } }),
    prisma.userStoreItem.findUnique({
      where: { userId_storeItemId: { userId, storeItemId } },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }
  if (!item || !item.active || !item.stripePriceId) {
    return NextResponse.json({ error: "Den här varan går inte att köpa just nu." }, { status: 400 });
  }
  if (alreadyOwned) {
    return NextResponse.json({ error: "Du äger redan den här." }, { status: 400 });
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

  const origin = request.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    // "payment" mode, not "subscription" - a one-time purchase, this is
    // the whole distinction between the store and the tier system.
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [{ price: item.stripePriceId, quantity: 1 }],
    success_url: `${origin}/sv/store?purchased=1`,
    cancel_url: `${origin}/sv/store`,
    metadata: { userId: user.id, storeItemId: item.id },
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
  });

  return NextResponse.json({ url: session.url });
}
