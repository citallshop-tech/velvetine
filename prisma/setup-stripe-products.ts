/**
 * Run once (and again any time you add/reprice a tier):
 *   npx tsx prisma/setup-stripe-products.ts
 *
 * Creates one Stripe Product + recurring Price per tier that doesn't
 * already have a stripePriceId, using the tier's current
 * priceMonthlySek. Safe to re-run - tiers that already have a price ID
 * are skipped, since Stripe prices are immutable (changing a price
 * means creating a new one, not editing the old one).
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

  const tiers = await prisma.tier.findMany({ orderBy: { level: "asc" } });

  for (const tier of tiers) {
    if (tier.stripePriceId) {
      console.log(`Hoppar över ${tier.name} - har redan ett Stripe-pris.`);
      continue;
    }

    const product = await stripe.products.create({
      name: `Velvetine – ${tier.name}`,
      metadata: { tierId: tier.id, level: String(tier.level) },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: "sek",
      unit_amount: tier.priceMonthlySek,
      recurring: { interval: "month" },
    });

    await prisma.tier.update({
      where: { id: tier.id },
      data: { stripePriceId: price.id },
    });

    console.log(`${tier.name}: skapad, pris-ID ${price.id} (${tier.priceMonthlySek / 100} kr/mån)`);
  }

  console.log(
    "\nOBS: gå till Stripe Dashboard → Products och sätt rätt skattekategori " +
      "(t.ex. \"Digital services\" eller liknande) på varje produkt för att " +
      "Stripe Tax ska räkna rätt momssats. Sätts inte automatiskt av det här skriptet."
  );
  console.log("Klart.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
