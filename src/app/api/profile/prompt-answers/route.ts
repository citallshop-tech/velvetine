import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const promptId = typeof body.promptId === "string" ? body.promptId : null;
  const answer = typeof body.answer === "string" ? body.answer.trim().slice(0, 300) : "";

  if (!promptId) {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (!answer) {
    // Empty answer clears it - an unanswered prompt shouldn't show on
    // the person's profile at all.
    await prisma.profilePromptAnswer.deleteMany({
      where: { userId, promptId },
    });
    return NextResponse.json({ ok: true, cleared: true });
  }

  await prisma.profilePromptAnswer.upsert({
    where: { userId_promptId: { userId, promptId } },
    create: { userId, promptId, answer },
    update: { answer },
  });

  return NextResponse.json({ ok: true });
}
