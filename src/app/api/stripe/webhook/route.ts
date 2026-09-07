import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import type Stripe from "stripe";

// Maps Stripe's subscription statuses onto our own enum. Stripe has a
// few more granular states (trialing, incomplete, incomplete_expired,
// unpaid) than we currently model - they all fold into the closest
// match rather than needing a bigger enum for statuses this app doesn't
// yet act on differently.
function mapStripeStatus(status: Stripe.Subscription.Status): "ACTIVE" | "PAST_DUE" | "CANCELED" | "NONE" {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "NONE";
  }
}

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: "Betalning är inte konfigurerad." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET saknas - kan inte verifiera webhook-anrop.");
    return NextResponse.json({ error: "Webhook ej konfigurerad." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Ingen signatur.");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook-signaturen kunde inte verifieras:", err);
    return NextResponse.json({ error: "Ogiltig signatur." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (session.mode === "payment") {
        // One-time store item purchase, not a subscription.
        const storeItemId = session.metadata?.storeItemId;
        if (userId && storeItemId) {
          await prisma.userStoreItem.upsert({
            where: { userId_storeItemId: { userId, storeItemId } },
            create: { userId, storeItemId },
            update: {},
          });
        }
        break;
      }

      const tierId = session.metadata?.tierId;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && tierId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tierId,
            stripeSubscriptionId: subscriptionId ?? undefined,
            subscriptionStatus: "ACTIVE",
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const tierId = subscription.metadata?.tierId;
      const status = mapStripeStatus(subscription.status);

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: status,
            // A canceled/past-due subscription loses tier-gated perks;
            // an active one keeps or (re)gains the tier from metadata.
            tierId: status === "ACTIVE" ? tierId ?? undefined : null,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "CANCELED", tierId: null },
        });
      }
      break;
    }

    default:
      // Unhandled event types are expected and fine to ignore - Stripe
      // sends many more event types than this app currently acts on.
      break;
  }

  return NextResponse.json({ received: true });
}
