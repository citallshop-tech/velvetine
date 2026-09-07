import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { calculateAge } from "@/lib/age";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileViewActions } from "@/components/ProfileViewActions";

const MIN_TIER_LEVEL_FOR_MESSAGE_FIRST = 4;

export default async function ProfileViewPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId: targetUserId } = await params;
  const viewerId = await getSessionUserId();
  if (!viewerId) {
    redirect({ href: "/login", locale });
    return;
  }

  if (viewerId === targetUserId) {
    redirect({ href: "/profile", locale });
    return;
  }

  const [viewer, target, blockedByMe, blockingMe, existingMatch] = await Promise.all([
    prisma.user.findUnique({ where: { id: viewerId }, select: { tier: { select: { level: true } } } }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        tier: true,
        promptAnswers: { include: { prompt: true }, take: 3, orderBy: { order: "asc" } },
        showcaseItems: { orderBy: { order: "asc" } },
        photos: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    }),
    prisma.block.findFirst({ where: { blockerId: viewerId, blockedId: targetUserId } }),
    prisma.block.findFirst({ where: { blockerId: targetUserId, blockedId: viewerId } }),
    prisma.match.findFirst({
      where: {
        OR: [
          { userAId: viewerId, userBId: targetUserId },
          { userAId: targetUserId, userBId: viewerId },
        ],
      },
    }),
  ]);

  if (!target || target.accountStatus !== "ACTIVE" || blockedByMe || blockingMe) {
    redirect({ href: "/dashboard", locale });
    return;
  }

  const equippedFrameItem = target.equippedFrameId
    ? await prisma.storeItem.findUnique({ where: { id: target.equippedFrameId } })
    : null;

  const p = await getTranslations("Profile");
  const s = await getTranslations("Showcase");
  const viewerTierLevel = viewer?.tier?.level ?? 0;

  const intentLabels: Record<string, string> = {
    SERIOUS: p("intentSerious"),
    CASUAL: p("intentCasual"),
    FRIENDSHIP: p("intentFriendship"),
    NOT_SURE: p("intentNotSure"),
  };
  const bodyTypeLabels: Record<string, string> = {
    SLIM: p("bodyTypeSlim"),
    ATHLETIC: p("bodyTypeAthletic"),
    AVERAGE: p("bodyTypeAverage"),
    CURVY: p("bodyTypeCurvy"),
    MUSCULAR: p("bodyTypeMuscular"),
    PLUS_SIZE: p("bodyTypePlusSize"),
  };
  const hairColorLabels: Record<string, string> = {
    BLONDE: p("hairColorBlonde"),
    BROWN: p("hairColorBrown"),
    BLACK: p("hairColorBlack"),
    RED: p("hairColorRed"),
    GRAY: p("hairColorGray"),
    OTHER: p("hairColorOther"),
  };
  const categoryLabels: Record<string, string> = {
    CAR: s("categoryCar"),
    BOAT: s("categoryBoat"),
    PLANE: s("categoryPlane"),
    PROPERTY: s("categoryProperty"),
    PET: s("categoryPet"),
    OTHER: s("categoryOther"),
  };

  const age = calculateAge(target.birthDate);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <AppHeader backHref={existingMatch ? "/matches" : "/dashboard"} />

        <ProfileCard
          data={{
            displayName: target.displayName,
            age,
            tierName: target.tier ? pickLocalized(locale, target.tier.name, target.tier.nameEn) : null,
            tierLevel: target.tier?.level ?? null,
            equippedFrame: equippedFrameItem
              ? { frameColor: equippedFrameItem.frameColor, frameStyle: equippedFrameItem.frameStyle }
              : null,
            verified: target.verified,
            bio: target.bio,
            heightCm: target.heightCm,
            occupation: target.occupation,
            bodyType: target.bodyType ? bodyTypeLabels[target.bodyType] : null,
            hairColor: target.hairColor ? hairColorLabels[target.hairColor] : null,
            locationCity: target.locationCity,
            locationCountry: target.locationCountry,
            relationshipIntent: target.relationshipIntent
              ? intentLabels[target.relationshipIntent]
              : null,
            promptAnswers: target.promptAnswers.map((pa) => ({
              id: pa.id,
              question: pickLocalized(locale, pa.prompt.question, pa.prompt.questionEn),
              answer: pa.answer,
            })),
            showcaseItems: target.showcaseItems.map((item) => ({
              id: item.id,
              label: `${categoryLabels[item.category]} — ${item.name}`,
              description: item.description,
              photoUrl: item.photoUrl,
            })),
            photoUrls: target.photos.map((photo) => photo.url),
            blurred: false,
          }}
        />

        <ProfileViewActions
          targetUserId={target.id}
          matchId={existingMatch?.id ?? null}
          canMessageFirst={viewerTierLevel >= MIN_TIER_LEVEL_FOR_MESSAGE_FIRST}
        />

        <AppFooter />
      </div>
    </div>
  );
}
