import { prisma } from "@/lib/prisma";

// How long a message survives before it's automatically deleted. Chosen
// as a reasonable balance between "long enough to actually have a
// conversation you can refer back to" and "short enough that this isn't
// really long-term storage of personal data" - adjust this single
// constant if a different retention window is wanted.
export const MESSAGE_RETENTION_DAYS = 90;

/**
 * Deletes messages in this match older than the retention window. Called
 * opportunistically when a match's thread is loaded, rather than a
 * scheduled job - simpler, and doesn't need any cron infrastructure to
 * work in local dev too, not just once deployed.
 *
 * Skips deletion entirely if either person in this match has an
 * unresolved (PENDING) report against them - not a legal requirement,
 * but auto-deleting potential evidence out from under an active
 * moderation/law-enforcement investigation would undermine the report
 * system itself. Deletion resumes normally once the report is resolved
 * (ACTIONED or DISMISSED).
 */
export async function deleteExpiredMessages(matchId: string): Promise<void> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { userAId: true, userBId: true },
  });
  if (!match) return;

  const openReport = await prisma.report.findFirst({
    where: {
      status: "PENDING",
      reportedUserId: { in: [match.userAId, match.userBId] },
    },
    select: { id: true },
  });
  if (openReport) return;

  const cutoff = new Date(Date.now() - MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.message.deleteMany({
    where: { matchId, createdAt: { lt: cutoff } },
  });
}

// How long a reviewed SafetyFlag stays around after being marked
// reviewed, before it's purged. Set to match the actual legal
// preservation expectation in the US (18 U.S.C. 2258A, as amended by
// the 2024 REPORT Act): a completed CyberTipline report is treated as
// a request to preserve the reported content for one year - this
// isn't a number Claude picked, it's what the law itself considers a
// reasonable window for law enforcement to follow up. Providers may
// voluntarily preserve longer; this doesn't do that by default.
export const SAFETY_FLAG_RETENTION_DAYS_AFTER_REVIEW = 365;

export async function deleteExpiredSafetyFlags(): Promise<void> {
  const cutoff = new Date(
    Date.now() - SAFETY_FLAG_RETENTION_DAYS_AFTER_REVIEW * 24 * 60 * 60 * 1000
  );
  await prisma.safetyFlag.deleteMany({
    where: { reviewedAt: { not: null, lt: cutoff } },
  });
}
