import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// Tier level 2 ("Utvald"/"Select") and up.
const MIN_TIER_LEVEL_FOR_INCOGNITO = 2;

export async function PATCH(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tier: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  if ((user.tier?.level ?? 0) < MIN_TIER_LEVEL_FOR_INCOGNITO) {
    return NextResponse.json(
      { error: "Kräver nivå Utvald eller högre." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const enabled = Boolean(body.enabled);

  await prisma.user.update({
    where: { id: userId },
    data: { incognitoMode: enabled },
  });

  return NextResponse.json({ ok: true, enabled });
}
