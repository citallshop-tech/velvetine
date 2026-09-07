import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
}

/**
 * Returns the current user if they're logged in AND flagged as admin,
 * otherwise null. Use this in every admin page and admin API route -
 * there is no other gate in front of /admin.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, displayName: true, email: true, isAdmin: true, accountStatus: true },
  });

  if (!user || !user.isAdmin || user.accountStatus !== "ACTIVE") return null;

  return { id: user.id, displayName: user.displayName, email: user.email };
}
