import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDiscoveryCandidates } from "@/lib/discovery";
import { pickLocalized } from "@/lib/localizedField";
import { DiscoverDeck } from "@/components/discover/DiscoverDeck";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";
import { NavBadge } from "@/components/NavBadge";
import { getUnreadMatchesCount, getNewLikesCount } from "@/lib/unread";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect({ href: "/login", locale });
    return;
  }

  const [candidates, viewer] = await Promise.all([
    getDiscoveryCandidates(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { tier: { select: { level: true } }, emailVerified: true, isAdmin: true },
    }),
  ]);
  const viewerTierLevel = viewer?.tier?.level ?? 0;

  const e = await getTranslations("EmailVerification");

  if (!viewer?.emailVerified) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-md mx-auto">
          <AppHeader backHref="/dashboard" />
          <div className="border border-gold rounded-sm bg-surface-raised p-6 text-center">
            <p className="text-ivory mb-2">{e("verifiedRequiredTitle")}</p>
            <p className="text-sm text-ivory-muted mb-4">{e("verifiedRequiredBody")}</p>
            <ResendVerificationButton />
          </div>
          <AppFooter />
        </div>
      </div>
    );
  }

  const h = await getTranslations("Header");
  const p = await getTranslations("Profile");
  const s = await getTranslations("Showcase");

  const [unreadMatches, newLikes] = await Promise.all([
    getUnreadMatchesCount(userId),
    getNewLikesCount(userId),
  ]);

  // A higher-tier person who already liked me has "opened contact" -
  // that choice is itself the unlock, regardless of whether I've liked
  // them back yet. Blur only exists to gate people who haven't reached
  // out at all.
  const likedMeIds = new Set(
    (
      await prisma.swipe.findMany({
        where: { toUserId: userId, direction: "LIKE" },
        select: { fromUserId: true },
      })
    ).map((s) => s.fromUserId)
  );

  const intentLabels: Record<string, string> = {
    SERIOUS: p("intentSerious"),
    CASUAL: p("intentCasual"),
    FRIENDSHIP: p("intentFriendship"),
    NOT_SURE: p("intentNotSure"),
  };

  const categoryLabels: Record<string, string> = {
    CAR: s("categoryCar"),
    BOAT: s("categoryBoat"),
    PLANE: s("categoryPlane"),
    PROPERTY: s("categoryProperty"),
    PET: s("categoryPet"),
    OTHER: s("categoryOther"),
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

  const countryLabels: Record<string, string> = {
    SE: p("countrySE"), NO: p("countryNO"), DK: p("countryDK"), FI: p("countryFI"),
    IS: p("countryIS"), GB: p("countryGB"), DE: p("countryDE"), FR: p("countryFR"),
    ES: p("countryES"), IT: p("countryIT"), NL: p("countryNL"), BE: p("countryBE"),
    AT: p("countryAT"), CH: p("countryCH"), IE: p("countryIE"), PT: p("countryPT"),
    PL: p("countryPL"), US: p("countryUS"), CA: p("countryCA"), AU: p("countryAU"),
    OTHER: p("countryOTHER"),
  };

  const equippedFrameIds = candidates
    .map((c) => c.equippedFrameId)
    .filter((id): id is string => id !== null);
  const frameItems =
    equippedFrameIds.length > 0
      ? await prisma.storeItem.findMany({ where: { id: { in: equippedFrameIds } } })
      : [];
  const frameById = new Map(frameItems.map((f) => [f.id, f] as const));

  function equippedFrameFor(equippedFrameId: string | null): { frameColor: string; frameStyle: string } | null {
    if (!equippedFrameId) return null;
    const f = frameById.get(equippedFrameId);
    return f ? { frameColor: f.frameColor, frameStyle: f.frameStyle } : null;
  }

  const serialized = candidates.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    birthDate: c.birthDate.toISOString(),
    bio: c.bio,
    heightCm: c.heightCm,
    occupation: c.occupation,
    bodyType: c.bodyType ? bodyTypeLabels[c.bodyType] : null,
    hairColor: c.hairColor ? hairColorLabels[c.hairColor] : null,
    locationCity: c.locationCity,
    locationCountry: c.locationCountry ? countryLabels[c.locationCountry] ?? c.locationCountry : null,
    relationshipIntent: c.relationshipIntent ? intentLabels[c.relationshipIntent] : null,
    tier: c.tier ? { name: pickLocalized(locale, c.tier.name, c.tier.nameEn) } : null,
    tierLevel: c.tier?.level ?? null,
    verified: c.verified,
    equippedFrame: equippedFrameFor(c.equippedFrameId),
    blurred: (c.tier?.level ?? 0) > viewerTierLevel && !likedMeIds.has(c.id),
    promptAnswers: c.promptAnswers.map((pa) => ({
      id: pa.id,
      answer: pa.answer,
      prompt: { question: pickLocalized(locale, pa.prompt.question, pa.prompt.questionEn) },
    })),
    showcaseItems: c.showcaseItems.map((item) => ({
      id: item.id,
      label: `${categoryLabels[item.category] ?? item.category} — ${item.name}`,
      description: item.description,
      photoUrl: item.photoUrl,
    })),
    photoUrls: c.photos.map((photo) => photo.url),
  }));

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <AppHeader
          backHref="/dashboard"
          rightNav={
            <>
              <Link href="/matches" className="text-sm text-ivory-muted hover:text-gold flex items-center">
                {h("myMatches")}
                <NavBadge count={unreadMatches} />
              </Link>
              <Link href="/likes" className="text-sm text-ivory-muted hover:text-gold flex items-center">
                {h("likes")}
                <NavBadge count={newLikes} />
              </Link>
              <Link href="/visitors" className="text-sm text-ivory-muted hover:text-gold">
                {h("visitors")}
              </Link>
              <Link href="/store" className="text-sm text-ivory-muted hover:text-gold">
                {h("store")}
              </Link>
              {viewer.isAdmin && (
                <Link href="/admin" className="text-sm text-gold hover:text-gold-bright">
                  {h("admin")}
                </Link>
              )}
            </>
          }
        />
      </div>
      <DiscoverDeck initialCandidates={serialized} viewerTierLevel={viewerTierLevel} />
      <div className="max-w-md mx-auto">
        <AppFooter />
      </div>
    </div>
  );
}
