/**
 * Run once (and again whenever a new credit pack is added):
 *   npx tsx prisma/setup-stripe-credit-packs.ts
 *
 * Creates one Stripe Product + one-time Price per gift-credit pack that
 * doesn't already have a stripePriceId. Safe to re-run - packs that
 * already have a price ID are skipped. Same pattern as
 * setup-stripe-store-items.ts, just for GiftCreditPack instead of
 * StoreItem - see claude/velvetine-status.md for why these are separate
 * from the store: a pack tops up User.giftCredits, it's never "owned" or
 * equipped like a frame/chat theme.
 */
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY saknas i .env - lägg till den innan du kör detta.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" });

  const packs = await prisma.giftCreditPack.findMany({ orderBy: { order: "asc" } });

  for (const pack of packs) {
    if (pack.stripePriceId) {
      console.log(`Hoppar över ${pack.name} - har redan ett Stripe-pris.`);
      continue;
    }

    const product = await stripe.products.create({
      name: `Velvetine – ${pack.name} (${pack.credits} poäng)`,
      metadata: { giftCreditPackId: pack.id },
    });

    // No `recurring` field - this is a one-time purchase, same as store items.
    const price = await stripe.prices.create({
      product: product.id,
      currency: "sek",
      unit_amount: pack.priceSek,
    });

    await prisma.giftCreditPack.update({
      where: { id: pack.id },
      data: { stripePriceId: price.id },
    });

    console.log(`${pack.name}: skapad, pris-ID ${price.id} (${pack.priceSek / 100} kr för ${pack.credits} poäng)`);
  }

  console.log("Klart.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
