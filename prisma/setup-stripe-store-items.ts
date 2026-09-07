/**
 * Run once (and again whenever a new store item is added):
 *   npx tsx prisma/setup-stripe-store-items.ts
 *
 * Creates one Stripe Product + one-time Price per store item that
 * doesn't already have a stripePriceId. Safe to re-run - items that
 * already have a price ID are skipped.
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

  const items = await prisma.storeItem.findMany({ orderBy: { order: "asc" } });

  for (const item of items) {
    if (item.stripePriceId) {
      console.log(`Hoppar över ${item.name} - har redan ett Stripe-pris.`);
      continue;
    }

    const product = await stripe.products.create({
      name: `Velvetine – ${item.name} (ram)`,
      metadata: { storeItemId: item.id },
    });

    // No `recurring` field - this is a one-time purchase, not a
    // subscription, which is the whole point of the store vs. tiers.
    const price = await stripe.prices.create({
      product: product.id,
      currency: "sek",
      unit_amount: item.priceSek,
    });

    await prisma.storeItem.update({
      where: { id: item.id },
      data: { stripePriceId: price.id },
    });

    console.log(`${item.name}: skapad, pris-ID ${price.id} (${item.priceSek / 100} kr, engångsköp)`);
  }

  console.log("Klart.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
