import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

// Placeholder tier names/prices - easy to rename or reprice later, this
// just needs to exist so registration/dashboard have real tiers to show.
const TIERS = [
  { name: "Ingång", nameEn: "Entry", level: 1, priceMonthlySek: 29900, badgeIcon: "tier-1", badgeColor: "#8a7355", requiresApplication: false },
  { name: "Utvald", nameEn: "Select", level: 2, priceMonthlySek: 59900, badgeIcon: "tier-2", badgeColor: "#a08048", requiresApplication: false },
  { name: "Reserverad", nameEn: "Reserved", level: 3, priceMonthlySek: 99900, badgeIcon: "tier-3", badgeColor: "#b8923f", requiresApplication: false },
  { name: "Förstklassig", nameEn: "Premier", level: 4, priceMonthlySek: 199900, badgeIcon: "tier-4", badgeColor: "#c9a24a", requiresApplication: true },
  { name: "Inre kretsen", nameEn: "Inner Circle", level: 5, priceMonthlySek: 349900, badgeIcon: "tier-5", badgeColor: "#d9b667", requiresApplication: true },
];

const PROMPTS = [
  { question: "En kväll jag inte kommer glömma...", questionEn: "An evening I won't forget...", category: "Om dig" },
  { question: "Det folk missförstår om mig är...", questionEn: "What people get wrong about me...", category: "Om dig" },
  { question: "Jag mår som bäst när...", questionEn: "I feel my best when...", category: "Livsstil" },
  { question: "Nästa resa jag drömmer om är...", questionEn: "The next trip I'm dreaming of...", category: "Livsstil" },
  { question: "Jag söker någon som...", questionEn: "I'm looking for someone who...", category: "Vad du söker" },
  { question: "En perfekt söndag ser ut så här...", questionEn: "A perfect Sunday looks like...", category: "Livsstil" },
];

const INTERESTS = [
  "Resor", "Matlagning", "Vin", "Konst", "Musik", "Träning",
  "Natur", "Litteratur", "Filosofi", "Segling", "Golf", "Foto",
];

async function main() {
  for (const tier of TIERS) {
    await prisma.tier.upsert({
      where: { name: tier.name },
      update: tier,
      create: tier,
    });
  }

  for (const prompt of PROMPTS) {
    const existing = await prisma.prompt.findFirst({
      where: { question: prompt.question },
    });
    if (existing) {
      await prisma.prompt.update({
        where: { id: existing.id },
        data: { questionEn: prompt.questionEn },
      });
    } else {
      await prisma.prompt.create({ data: prompt });
    }
  }

  for (const name of INTERESTS) {
    await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const STORE_ITEMS = [
    {
      name: "Roséguld",
      nameEn: "Rose Gold",
      description: "En varm roséguld-ram runt din profilbild.",
      category: "FRAME" as const,
      priceSek: 4900,
      frameColor: "#c98f7a",
      frameStyle: "solid",
      order: 1,
    },
    {
      name: "Platina",
      nameEn: "Platinum",
      description: "Sval, silvrig platinaram.",
      category: "FRAME" as const,
      priceSek: 4900,
      frameColor: "#c7c9cc",
      frameStyle: "solid",
      order: 2,
    },
    {
      name: "Smaragd",
      nameEn: "Emerald",
      description: "Djup smaragdgrön ram med en subtil glöd.",
      category: "FRAME" as const,
      priceSek: 6900,
      frameColor: "#3e8e6f",
      frameStyle: "glow",
      order: 3,
    },
    {
      name: "Safir",
      nameEn: "Sapphire",
      description: "Djupblå safirram med en subtil glöd.",
      category: "FRAME" as const,
      priceSek: 6900,
      frameColor: "#3a5f9e",
      frameStyle: "glow",
      order: 4,
    },
    {
      name: "Diamant",
      nameEn: "Diamond",
      description: "Den mest exklusiva ramen - vit glittrig diamant-stil med dubbel ring.",
      category: "FRAME" as const,
      priceSek: 14900,
      frameColor: "#e8e6f0",
      frameStyle: "double-glow",
      order: 5,
    },
  ];

  for (const item of STORE_ITEMS) {
    const existing = await prisma.storeItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.storeItem.create({ data: item });
    }
  }

  console.log(`Seeded ${TIERS.length} tiers, ${PROMPTS.length} prompts, ${INTERESTS.length} interests, ${STORE_ITEMS.length} store items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
