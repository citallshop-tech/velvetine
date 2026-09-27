import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/imageUpload";

// TILLAGD 2026-09-27 (se claude/velvetine-status.md) - Christoffers
// uttryckliga instruktion: raderas ett konto och personen inte begått
// något brott ska innehållet verkligen bort (vi ska inte sitta på
// kunders information i onödan, oavsett vad andra tjänster gör) - men om
// ett brott/en utredning pågår mot personen måste bevis kunna sparas så
// länge lagen kräver eller utredningen pågår. Villkoren (/villkor, punkt
// om radering) lovar redan exakt detta: bilder, profilfrågor, intressen,
// skrytprylar och verifieringsselfie tas bort permanent, MEN uppgifter
// kopplade till rapporter/säkerhetsflaggor är undantagna så länge en
// utredning pågår.
//
// `Report` har ingen egen kopia av bilder/meddelanden (bara fritext +
// AI-sammanfattning), så en olöst (PENDING) rapport mot personen måste
// skjuta upp den riktiga raderingen av profilinnehållet - annars finns
// inget kvar att bedöma om en admin senare löser rapporten. `SafetyFlag`
// har DÄREMOT sin egen sparade `imageUrl` oberoende av Photo-tabellen
// (se schema-kommentaren där), så den påverkas aldrig av att vi raderar
// profilbilder - men en helt ogranskad flagga räknas ändå som en pågående
// utredning här, för säkerhets marginal.

/**
 * True if this user has an unresolved report against them, or an
 * unreviewed safety flag - i.e. an investigation that might still need
 * to look at their actual profile content. Blocks the real content
 * erasure below until true is false (checked again automatically the
 * next time a report about them is resolved - see
 * src/app/api/admin/reports/[id]/resolve/route.ts).
 */
export async function hasOpenInvestigation(userId: string): Promise<boolean> {
  const [pendingReport, unreviewedFlag] = await Promise.all([
    prisma.report.findFirst({
      where: { reportedUserId: userId, status: "PENDING" },
      select: { id: true },
    }),
    prisma.safetyFlag.findFirst({
      where: { userId, reviewedAt: null },
      select: { id: true },
    }),
  ]);
  return Boolean(pendingReport || unreviewedFlag);
}

/**
 * The actual, permanent erasure of everything Villkoren promises gets
 * deleted (bilder, profilfrågor, intressen, skrytprylar,
 * verifieringsselfie) - both the database rows AND the underlying Blob
 * files. Never call this without checking hasOpenInvestigation() first.
 * Safe to call more than once (nothing left the second time = no-op).
 */
export async function eraseProfileContent(userId: string): Promise<void> {
  const [photos, showcaseItems, selfie] = await Promise.all([
    prisma.photo.findMany({ where: { userId }, select: { id: true, url: true } }),
    prisma.showcaseItem.findMany({ where: { userId }, select: { id: true, photoUrl: true } }),
    prisma.verificationSelfie.findUnique({ where: { userId }, select: { selfieUrl: true } }),
  ]);

  // Blob files first (deleteImage() never throws, see src/lib/imageUpload.ts),
  // then the database rows.
  await Promise.all([
    ...photos.map((p) => deleteImage(p.url)),
    ...showcaseItems.filter((s) => s.photoUrl).map((s) => deleteImage(s.photoUrl!)),
    selfie ? deleteImage(selfie.selfieUrl) : Promise.resolve(),
  ]);

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { userId } }),
    prisma.profilePromptAnswer.deleteMany({ where: { userId } }),
    prisma.userInterest.deleteMany({ where: { userId } }),
    prisma.showcaseItem.deleteMany({ where: { userId } }),
    prisma.verificationSelfie.deleteMany({ where: { userId } }),
  ]);
}

/**
 * The single shared "delete this account" routine - used by both the
 * self-service route (src/app/api/account/delete/route.ts) and the admin
 * route (src/app/api/admin/users/[id]/delete/route.ts), so the two never
 * drift apart again the way they had before this fix (only the Stripe-
 * cancellation part had been added to both; the real-erasure part below
 * was missing from both until now).
 */
export async function deleteAccount(userId: string): Promise<void> {
  if (!(await hasOpenInvestigation(userId))) {
    await eraseProfileContent(userId);
  }
  // If there IS an open investigation, profile content is deliberately
  // left in place - see maybeEraseAfterReportResolved() below, called
  // from the report-resolve route once no open investigation remains.

  await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: "DELETED",
      deletedAt: new Date(),
      email: `deleted-${userId}@velvetine.invalid`,
      displayName: "Borttaget konto",
      bio: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "NONE",
    },
  });
}

/**
 * Called after an admin resolves a report (src/app/api/admin/reports/[id]/
 * resolve/route.ts). If the reported user had already asked to delete
 * their account (accountStatus DELETED) but their content erasure was
 * held back because THIS was the open investigation, and no other open
 * investigation remains, finish the erasure now.
 */
export async function maybeEraseAfterReportResolved(reportedUserId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: reportedUserId },
    select: { accountStatus: true },
  });
  if (user?.accountStatus !== "DELETED") return;
  if (await hasOpenInvestigation(reportedUserId)) return;
  await eraseProfileContent(reportedUserId);
}
