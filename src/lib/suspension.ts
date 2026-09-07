import { prisma } from "@/lib/prisma";

/**
 * If this user is SUSPENDED with an expiry that has passed, flips them
 * back to ACTIVE and clears the expiry. Returns the up-to-date user.
 *
 * There's no cron job in this project, so reactivation happens lazily:
 * the moment a suspended-but-expired user tries to log in or load any
 * page that checks their status, this runs and lifts the suspension
 * before continuing. A permanent ban (BANNED) or self/admin deletion
 * (DELETED) never has suspendedUntil set, so this only ever touches
 * genuine timed suspensions.
 */
export async function reactivateIfExpired<
  T extends { id: string; accountStatus: string; suspendedUntil: Date | null }
>(user: T): Promise<T> {
  if (
    user.accountStatus === "SUSPENDED" &&
    user.suspendedUntil &&
    user.suspendedUntil <= new Date()
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { accountStatus: "ACTIVE", suspendedUntil: null },
    });
    return { ...user, accountStatus: "ACTIVE", suspendedUntil: null } as T;
  }

  return user;
}
