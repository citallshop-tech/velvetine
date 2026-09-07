import { prisma } from "@/lib/prisma";

interface UnreadCheckMatch {
  userAId: string;
  userBId: string;
  lastReadByA: Date | null;
  lastReadByB: Date | null;
  messages: { senderId: string; createdAt: Date }[]; // most recent first; empty array is fine
}

/**
 * A match counts as "unread" if either:
 * - This user has never opened the thread at all (lastReadByX is null),
 *   even if there are zero messages yet - a fresh match is itself worth
 *   noticing, or
 * - The other person's most recent message came in after this user's
 *   last read timestamp.
 *
 * Only looks at the single most recent message (messages[0]) rather than
 * counting every unread message - callers already fetch just the latest
 * message for display, and "is there anything new" only needs that one.
 */
export function isMatchUnread(match: UnreadCheckMatch, userId: string): boolean {
  const isUserA = match.userAId === userId;
  const lastRead = isUserA ? match.lastReadByA : match.lastReadByB;

  if (lastRead === null) {
    return true;
  }

  const lastMessage = match.messages[0];
  if (!lastMessage || lastMessage.senderId === userId) {
    return false;
  }

  return lastMessage.createdAt > lastRead;
}

export function unreadMatchCount(matches: UnreadCheckMatch[], userId: string): number {
  return matches.filter((m) => isMatchUnread(m, userId)).length;
}

// Query helpers (the pure functions above take already-fetched data;
// these do the fetching for callers that just want a number).

export async function getUnreadMatchesCount(userId: string): Promise<number> {
  const matches = await prisma.match.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    select: {
      userAId: true,
      userBId: true,
      lastReadByA: true,
      lastReadByB: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { senderId: true, createdAt: true } },
    },
  });

  return unreadMatchCount(matches, userId);
}

export async function getNewLikesCount(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastViewedLikesAt: true },
  });

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  const matchedIds = new Set(
    matches.flatMap((m) => [m.userAId, m.userBId]).filter((id) => id !== userId)
  );

  const [blockedByMe, blockingMe] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ]);
  const excludeIds = Array.from(
    new Set<string>([
      ...matchedIds,
      ...blockedByMe.map((b) => b.blockedId),
      ...blockingMe.map((b) => b.blockerId),
    ])
  );

  return prisma.swipe.count({
    where: {
      toUserId: userId,
      direction: "LIKE",
      fromUserId: { notIn: excludeIds },
      fromUser: { accountStatus: "ACTIVE" },
      createdAt: user?.lastViewedLikesAt ? { gt: user.lastViewedLikesAt } : undefined,
    },
  });
}
