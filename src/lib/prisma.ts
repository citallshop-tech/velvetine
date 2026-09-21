import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// rejectUnauthorized: false works around a known Prisma 7 + Supabase issue -
// Prisma 7's node-pg-based engine verifies SSL certs strictly, and Supabase's
// pooler cert chain isn't always in Node's default trust store. The
// connection is still encrypted, this just skips chain verification.
//
// TILLAGD 2026-09-21 - "max: 3" (node-postgres Poolens egen gräns, defaultar
// annars till 10). Grunden: `next build` kör flera build-workers/processer
// PARALLELLT för att förrendera sidor (fler nu när butik-info m.fl. också
// hämtar data för alla fyra språk), och den globala singleton-cachen
// (globalForPrisma nedan) delas bara INOM en och samma process - den hindrar
// INTE flera separata build-workers från att var och en skapa sin egen
// PrismaPg-adapter/pool. Utan en egen gräns kunde det tillsammans nå fler
// samtidiga anslutningar än vad Supabases "Session pooler" tillåter (15,
// se claude/leverantorer-och-tjanster.md), vilket gav
// "(EMAXCONNSESSION) max clients reached in session mode" mitt i bygget.
// Med max 3 per process/pool håller sig totalen under gränsen även om flera
// workers kör samtidigt. Påverkar inte produktionen på Vercel (som redan
// använder Transaction pooler via en annan DATABASE_URL, se samma dokument).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
