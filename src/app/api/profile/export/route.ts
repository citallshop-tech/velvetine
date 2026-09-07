import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tier: true,
      photos: true,
      promptAnswers: { include: { prompt: true } },
      interests: { include: { interest: true } },
      showcaseItems: true,
      // Only this user's own reports and swipes - not ones made against
      // them, which are someone else's input, not data "provided by"
      // this person under GDPR Art. 20.
      reportsMade: true,
      swipesMade: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { select: { id: true, displayName: true } },
      userB: { select: { id: true, displayName: true } },
      // Only messages this person sent - the other side's messages are
      // their data, not this person's, under the same reasoning as above.
      messages: { where: { senderId: userId }, orderBy: { createdAt: "asc" } },
    },
  });

  const data = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      birthDate: user.birthDate,
      gender: user.gender,
      seekingGender: user.seekingGender,
      createdAt: user.createdAt,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      identityVerified: user.verified,
      warningCount: user.warningCount,
      specialCategoryConsentAt: user.specialCategoryConsentAt,
    },
    subscription: {
      tier: user.tier?.name ?? null,
      subscriptionStatus: user.subscriptionStatus,
    },
    profile: {
      bio: user.bio,
      heightCm: user.heightCm,
      occupation: user.occupation,
      bodyType: user.bodyType,
      hairColor: user.hairColor,
      locationCity: user.locationCity,
      locationCountry: user.locationCountry,
      relationshipIntent: user.relationshipIntent,
    },
    hiddenMatchingPreferences: {
      prefHeightMin: user.prefHeightMin,
      prefHeightMax: user.prefHeightMax,
      prefBodyTypes: user.prefBodyTypes,
      prefHairColors: user.prefHairColors,
    },
    photos: user.photos.map((p) => ({ url: p.url, isPrimary: p.isPrimary })),
    promptAnswers: user.promptAnswers.map((pa) => ({
      question: pa.prompt.question,
      answer: pa.answer,
    })),
    interests: user.interests.map((ui) => ui.interest.name),
    showcaseItems: user.showcaseItems.map((s) => ({
      category: s.category,
      name: s.name,
      description: s.description,
      photoUrl: s.photoUrl,
    })),
    matches: matches.map((m) => {
      const other = m.userAId === userId ? m.userB : m.userA;
      return {
        matchedWith: other.displayName,
        matchedAt: m.createdAt,
        status: m.status,
        myMessages: m.messages.map((msg) => ({
          content: msg.content,
          sentAt: msg.createdAt,
        })),
      };
    }),
    swipesIMade: user.swipesMade.map((s) => ({
      direction: s.direction,
      createdAt: s.createdAt,
    })),
    reportsIFiled: user.reportsMade.map((r) => ({
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="velvetine-mina-uppgifter-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
