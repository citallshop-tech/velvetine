import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const tierId = typeof body?.tierId === "string" ? body.tierId : null;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : null;

  if (!tierId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const tier = await prisma.tier.findUnique({ where: { id: tierId } });
  if (!tier || !tier.requiresApplication) {
    return NextResponse.json({ error: "Den här nivån kräver ingen ansökan." }, { status: 400 });
  }

  const existing = await prisma.tierApplication.findUnique({
    where: { userId_tierId: { userId, tierId } },
  });

  if (existing && existing.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Du har redan en ansökan för den här nivån." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  // Payment is the real gate here, not a subjective judgment call on the
  // note text - the one thing worth actually blocking is someone with a
  // history of bad behavior trying to buy their way into an exclusive
  // tier. A currently banned/suspended account can't reach this route
  // anyway (blocked at login), but this stays as a cheap safety net in
  // case that ever changes.
  const inGoodStanding = user.accountStatus === "ACTIVE";

  // A previously rejected application can be resubmitted - reset rather
  // than creating a second row, since (userId, tierId) is unique.
  const application = await prisma.tierApplication.upsert({
    where: { userId_tierId: { userId, tierId } },
    create: {
      userId,
      tierId,
      note,
      status: inGoodStanding ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: "auto",
    },
    update: {
      note,
      status: inGoodStanding ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: "auto",
    },
  });

  return NextResponse.json({ ok: true, application });
}
