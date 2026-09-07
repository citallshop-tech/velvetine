import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, destroySession } from "@/lib/auth";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  // Soft-delete: mark as deleted and scrub personal fields, rather than a
  // hard row delete. Matches/messages/reports reference this user id, and
  // keeping the row (with content scrubbed) avoids either cascading deletes
  // through someone else's match history or leaving dangling references.
  // NOTE: once Stripe is wired in, this must also cancel any active
  // subscription - do that before this route is called from production.
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: "DELETED",
      deletedAt: new Date(),
      email: `deleted-${userId}@velvetine.invalid`,
      displayName: "Borttaget konto",
      bio: null,
    },
  });

  await destroySession();

  return NextResponse.json({ ok: true });
}
