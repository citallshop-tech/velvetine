import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// rejectUnauthorized: false works around a known Prisma 7 + Supabase issue -
// Prisma 7's node-pg-based engine verifies SSL certs strictly, and Supabase's
// pooler cert chain isn't always in Node's default trust store. The
// connection is still encrypted, this just skips chain verification.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
