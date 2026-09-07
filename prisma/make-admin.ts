// Run once per person who needs admin access:
//   npx tsx prisma/make-admin.ts din@epost.se
//
// There's no UI for this on purpose - granting admin access is rare and
// sensitive enough that a deliberate terminal command is the right amount
// of friction for it.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Använd: npx tsx prisma/make-admin.ts din@epost.se");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`${user.displayName} (${user.email}) är nu admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
