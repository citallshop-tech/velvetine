import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

// Placeholder tier names/prices - easy to rename or reprice later, this
// just needs to exist so registration/dashboard have real tiers to show.
// TILLAGD 2026-09-21 - nameDe/nameEs (se claude/velvetine-status.md). DE/ES
// matchar exakt tier-namnen som redan används på startsidan (messages/de.json
// & es.json, Home-sektionen) så att samma tiernamn syns överallt i appen.
const TIERS = [
  { name: "Ingång", nameEn: "Entry", nameDe: "Einstieg", nameEs: "Inicial", level: 1, priceMonthlySek: 29900, badgeIcon: "tier-1", badgeColor: "#8a7355", requiresApplication: false },
  { name: "Utvald", nameEn: "Select", nameDe: "Ausgewählt", nameEs: "Selecto", level: 2, priceMonthlySek: 59900, badgeIcon: "tier-2", badgeColor: "#a08048", requiresApplication: false },
  { name: "Reserverad", nameEn: "Reserved", nameDe: "Reserviert", nameEs: "Reservado", level: 3, priceMonthlySek: 99900, badgeIcon: "tier-3", badgeColor: "#b8923f", requiresApplication: false },
  { name: "Förstklassig", nameEn: "Premier", nameDe: "Premier", nameEs: "Premier", level: 4, priceMonthlySek: 199900, badgeIcon: "tier-4", badgeColor: "#c9a24a", requiresApplication: true },
  { name: "Inre kretsen", nameEn: "Inner Circle", nameDe: "Innerer Kreis", nameEs: "Círculo Íntimo", level: 5, priceMonthlySek: 349900, badgeIcon: "tier-5", badgeColor: "#d9b667", requiresApplication: true },
];

// TILLAGD 2026-09-21 - questionDe/questionEs.
const PROMPTS = [
  { question: "En kväll jag inte kommer glömma...", questionEn: "An evening I won't forget...", questionDe: "Ein Abend, den ich nie vergessen werde...", questionEs: "Una noche que no olvidaré...", category: "Om dig" },
  { question: "Det folk missförstår om mig är...", questionEn: "What people get wrong about me...", questionDe: "Was die Leute an mir missverstehen, ist...", questionEs: "Lo que la gente malinterpreta de mí es...", category: "Om dig" },
  { question: "Jag mår som bäst när...", questionEn: "I feel my best when...", questionDe: "Ich fühle mich am besten, wenn...", questionEs: "Me siento mejor cuando...", category: "Livsstil" },
  { question: "Nästa resa jag drömmer om är...", questionEn: "The next trip I'm dreaming of...", questionDe: "Die nächste Reise, von der ich träume, ist...", questionEs: "El próximo viaje con el que sueño es...", category: "Livsstil" },
  { question: "Jag söker någon som...", questionEn: "I'm looking for someone who...", questionDe: "Ich suche jemanden, der...", questionEs: "Busco a alguien que...", category: "Vad du söker" },
  { question: "En perfekt söndag ser ut så här...", questionEn: "A perfect Sunday looks like...", questionDe: "Ein perfekter Sonntag sieht so aus...", questionEs: "Un domingo perfecto se ve así...", category: "Livsstil" },
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
        data: {
          questionEn: prompt.questionEn,
          // TILLAGD 2026-09-21 - backfyllar de/es på befintliga rader också,
          // inte bara nya (samma som questionEn redan gjorde).
          questionDe: prompt.questionDe,
          questionEs: prompt.questionEs,
        },
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

  // Explicit type annotation (rather than letting TS infer it from the
  // array literal) - needed because the FRAME and CHAT_THEME entries
  // below have different optional fields, and without this TS infers a
  // discriminated union that Prisma's create() can't match against every
  // item in the loop further down.
  const STORE_ITEMS: Prisma.StoreItemCreateInput[] = [
    {
      name: "Roséguld",
      nameEn: "Rose Gold",
      nameDe: "Roségold",
      nameEs: "Oro Rosa",
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
      nameDe: "Platin",
      nameEs: "Platino",
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
      nameDe: "Smaragd",
      nameEs: "Esmeralda",
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
      nameDe: "Saphir",
      nameEs: "Zafiro",
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
      nameDe: "Diamant",
      nameEs: "Diamante",
      description: "Den mest exklusiva ramen - vit glittrig diamant-stil med dubbel ring.",
      category: "FRAME" as const,
      priceSek: 14900,
      frameColor: "#e8e6f0",
      frameStyle: "double-glow",
      order: 5,
    },
    {
      name: "Midnattsblå chatt",
      nameEn: "Midnight Blue Chat",
      nameDe: "Mitternachtsblauer Chat",
      nameEs: "Chat Azul Medianoche",
      description: "Ett djupblått, natt-tema för dina chattkonversationer.",
      category: "CHAT_THEME" as const,
      priceSek: 3900,
      frameColor: "#1e3a5f", // unused for this category, placeholder
      frameStyle: "solid",
      chatBubbleColor: "#2d5a8f",
      chatBackgroundColor: "#0f1e30",
      order: 6,
    },
    {
      name: "Roströd chatt",
      nameEn: "Rust Chat",
      nameDe: "Rostroter Chat",
      nameEs: "Chat Óxido",
      description: "Varm roströd ton för dina konversationer.",
      category: "CHAT_THEME" as const,
      priceSek: 3900,
      frameColor: "#8b4a3a",
      frameStyle: "solid",
      chatBubbleColor: "#a8563f",
      chatBackgroundColor: "#2a1712",
      order: 7,
    },
    {
      name: "Skogsgrön chatt",
      nameEn: "Forest Green Chat",
      nameDe: "Waldgrüner Chat",
      nameEs: "Chat Verde Bosque",
      description: "Djup, lugn skogsgrön ton för dina konversationer.",
      category: "CHAT_THEME" as const,
      priceSek: 3900,
      frameColor: "#2f4a3a",
      frameStyle: "solid",
      chatBubbleColor: "#3d6650",
      chatBackgroundColor: "#131f19",
      order: 8,
    },
    {
      name: "Kunglig lila chatt",
      nameEn: "Royal Purple Chat",
      nameDe: "Königslila Chat",
      nameEs: "Chat Púrpura Real",
      description: "Rik, kunglig lila ton för dina konversationer.",
      category: "CHAT_THEME" as const,
      priceSek: 5900,
      frameColor: "#4a2f5f",
      frameStyle: "solid",
      chatBubbleColor: "#6b3f8f",
      chatBackgroundColor: "#1e1526",
      order: 9,
    },

    // TILLAGD 2026-09-21 - lyx-tillbehör, tredje byggpasset samma dag (se
    // claude/velvetine-status.md för fullständig bakgrund). Alla nya varor
    // nedan har active: false med flit - de finns i databasen och all UI
    // (Butiken, ChatThread, ProfileCard) är byggd och redo för dem, men de
    // syns inte för riktiga användare förrän Christoffer (1) bestämmer sig
    // för slutgiltiga priser och (2) sätter upp riktiga Stripe-produkter
    // för dem (samma script-mönster som setup-stripe-store-items.ts) - helt
    // i linje med den stående regeln att aldrig röra betalning/Stripe utan
    // hans godkännande. Att sätta active: true är det enda som krävs för
    // att slå på en vara när han är redo.
    {
      name: "Onyx",
      nameEn: "Onyx",
      nameDe: "Onyx",
      nameEs: "Ónix",
      description: "En djupsvart ram med en subtil, levande glans - butikens mest exklusiva ram.",
      category: "FRAME" as const,
      priceSek: 18900,
      frameColor: "#1c1c1c",
      frameStyle: "shimmer",
      order: 10,
      active: false,
    },
    {
      name: "Pärlvit",
      nameEn: "Pearl White",
      nameDe: "Perlweiß",
      nameEs: "Blanco Perla",
      description: "En ljus, pärlemorskimrande ram med samma levande glans som Onyx.",
      category: "FRAME" as const,
      priceSek: 18900,
      frameColor: "#e8e3d9",
      frameStyle: "shimmer",
      order: 11,
      active: false,
    },
    {
      name: "Midnattsguld",
      nameEn: "Midnight Gold",
      nameDe: "Mitternachtsgold",
      nameEs: "Oro de Medianoche",
      description: "Ett djupt, guldskimrande bakgrundstema bakom hela ditt profilkort.",
      category: "PROFILE_BACKGROUND" as const,
      priceSek: 12900,
      frameColor: "#3a2f12", // unused for this category, placeholder (see CHAT_THEME items above)
      frameStyle: "solid",
      backgroundGradient: "linear-gradient(160deg, #0f1420 0%, #1a2340 55%, #3a2f12 100%)",
      order: 12,
      active: false,
    },
    {
      name: "Vinröd sammet",
      nameEn: "Wine Velvet",
      nameDe: "Weinroter Samt",
      nameEs: "Terciopelo Vino",
      description: "Ett djupt vinrött bakgrundstema, samma varma ton som appens egen accentfärg.",
      category: "PROFILE_BACKGROUND" as const,
      priceSek: 12900,
      frameColor: "#5a1f2c",
      frameStyle: "solid",
      backgroundGradient: "linear-gradient(160deg, #1a0e12 0%, #3f1420 60%, #5a1f2c 100%)",
      order: 13,
      active: false,
    },
    {
      name: "Djup smaragd",
      nameEn: "Deep Emerald",
      nameDe: "Tiefes Smaragdgrün",
      nameEs: "Esmeralda Profunda",
      description: "Ett mörkt, smaragdgrönt bakgrundstema.",
      category: "PROFILE_BACKGROUND" as const,
      priceSek: 12900,
      frameColor: "#1f4a35",
      frameStyle: "solid",
      backgroundGradient: "linear-gradient(160deg, #0c1a14 0%, #163828 55%, #1f4a35 100%)",
      order: 14,
      active: false,
    },
    {
      name: "Champagnefunkel",
      nameEn: "Champagne Sparkle",
      nameDe: "Champagner-Glanz",
      nameEs: "Destello Champán",
      description: "Ett varmt, champagnefärgat bakgrundstema.",
      category: "PROFILE_BACKGROUND" as const,
      priceSek: 12900,
      frameColor: "#5c4a2a",
      frameStyle: "solid",
      backgroundGradient: "linear-gradient(160deg, #1c1712 0%, #3a2f1d 55%, #5c4a2a 100%)",
      order: 15,
      active: false,
    },
    {
      name: "Ros",
      nameEn: "Rose",
      nameDe: "Rose",
      nameEs: "Rosa",
      description: "En klassisk gest - skicka en ros i chatten.",
      category: "DIGITAL_GIFT" as const,
      priceSek: 2900,
      frameColor: "#5a2f3f", // unused for this category, placeholder
      frameStyle: "solid",
      giftEmoji: "🌹",
      order: 16,
      active: false,
    },
    {
      name: "Champagne",
      nameEn: "Champagne",
      nameDe: "Champagner",
      nameEs: "Champán",
      description: "Skål för matchningen.",
      category: "DIGITAL_GIFT" as const,
      priceSek: 3900,
      frameColor: "#8a7355",
      frameStyle: "solid",
      giftEmoji: "🥂",
      order: 17,
      active: false,
    },
    {
      name: "Stjärnfall",
      nameEn: "Shooting Star",
      nameDe: "Sternschnuppe",
      nameEs: "Estrella Fugaz",
      description: "Något litet extra för att sticka ut.",
      category: "DIGITAL_GIFT" as const,
      priceSek: 4900,
      frameColor: "#b8923f",
      frameStyle: "solid",
      giftEmoji: "🌠",
      order: 18,
      active: false,
    },
    {
      name: "Diamant-gåva",
      nameEn: "Diamond Gift",
      nameDe: "Diamant-Geschenk",
      nameEs: "Regalo de Diamante",
      description: "Butikens mest exklusiva present.",
      category: "DIGITAL_GIFT" as const,
      priceSek: 7900,
      frameColor: "#e8e6f0",
      frameStyle: "solid",
      giftEmoji: "💎",
      order: 19,
      active: false,
    },
  ];

  for (const item of STORE_ITEMS) {
    const existing = await prisma.storeItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.storeItem.create({ data: item });
    } else {
      // TILLAGD 2026-09-21 - backfyllar nameDe/nameEs (och nu även
      // backgroundGradient/giftEmoji) på redan existerande rader (tidigare
      // gjorde loopen ingenting alls för befintliga items, så nameEn hade
      // samma hål - nu rättat för alla fält som kan behöva uppdateras).
      await prisma.storeItem.update({
        where: { id: existing.id },
        data: {
          nameEn: item.nameEn,
          nameDe: item.nameDe,
          nameEs: item.nameEs,
          backgroundGradient: "backgroundGradient" in item ? item.backgroundGradient : undefined,
          giftEmoji: "giftEmoji" in item ? item.giftEmoji : undefined,
        },
      });
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
