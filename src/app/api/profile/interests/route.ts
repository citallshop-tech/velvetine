import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const interestId = typeof body.interestId === "string" ? body.interestId : null;
  const selected = Boolean(body.selected);

  if (!interestId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (selected) {
    await prisma.userInterest.upsert({
      where: { userId_interestId: { userId, interestId } },
      create: { userId, interestId },
      update: {},
    });
  } else {
    await prisma.userInterest.deleteMany({
      where: { userId, interestId },
    });
  }

  return NextResponse.json({ ok: true });
}
