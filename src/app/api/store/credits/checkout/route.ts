import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// TILLAGD 2026-09-27 (se claude/velvetine-status.md) - startar en Stripe
// engångsbetalning för ett poängpaket (GiftCreditPack). Samma mönster som
// /api/store/checkout (StoreItem), men det finns inget "redan ägs"-läge
// här - man kan köpa hur många paket som helst, poängen bara läggs på.
// Krediteringen sker i webhooken (checkout.session.completed), aldrig här -
// den här routen ENDAST skapar Stripe-sessionen.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: "Betalning är inte konfigurerad ännu." }, { status: 503 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const packId = typeof body?.packId === "string" ? body.packId : null;
  if (!packId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const [user, pack] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.giftCreditPack.findUnique({ where: { id: packId } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }
  if (!pack || !pack.active || !pack.stripePriceId) {
    return NextResponse.json({ error: "Det här paketet går inte att köpa just nu." }, { status: 400 });
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
    // "payment" mode, not "subscription" - a one-time purchase, same
    // distinction as /api/store/checkout.
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [{ price: pack.stripePriceId, quantity: 1 }],
    success_url: `${origin}/sv/store?creditsPurchased=1`,
    cancel_url: `${origin}/sv/store`,
    // giftCreditPackId skiljer den här sortens köp från ett vanligt
    // StoreItem-köp i webhooken - se stripe/webhook/route.ts.
    metadata: { userId: user.id, giftCreditPackId: pack.id },
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
  });

  return NextResponse.json({ url: session.url });
}
