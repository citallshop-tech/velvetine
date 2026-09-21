import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDiscoveryCandidates, type DiscoveryFilters } from "@/lib/discovery";
import { pickLocalized } from "@/lib/localizedField";
import { countryLabel, REGION_ORDER, type Region } from "@/lib/countries";
import { DiscoverDeck } from "@/components/discover/DiscoverDeck";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";
import { NavBadge } from "@/components/NavBadge";
import { getUnreadMatchesCount, getNewLikesCount } from "@/lib/unread";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

// TILLAGT 2026-09-21 - sök på land/område i Bläddra (se DiscoverFilters.tsx
// och src/lib/discovery.ts). "country"/"region" i URL:en (query params) i
// stället för egen state/API-anrop, eftersom sidan redan är en async server-
// komponent som hämtar kandidater på serversidan - en vanlig länk-navigering
// (GET) räcker, ingen extra klient-fetch eller route krävs.
function parseFilters(searchParams: Record<string, string | string[] | undefined>): DiscoveryFilters {
  const countryRaw = searchParams.country;
  const regionRaw = searchParams.region;
  const cityRaw = searchParams.city;
  const country = typeof countryRaw === "string" && countryRaw ? countryRaw : undefined;
  const region =
    typeof regionRaw === "string" && (REGION_ORDER as string[]).includes(regionRaw)
      ? (regionRaw as Region)
      : undefined;
  const city = typeof cityRaw === "string" && cityRaw.trim() ? cityRaw.trim().slice(0, 100) : undefined;
  // Ett specifikt land vinner om land och område båda råkar vara satta
  // samtidigt. Stad/kommun gäller alltid utöver, oavsett vilket av de två.
  // Fast returtyp (DiscoveryFilters) istället för att låta TS lägga ihop
  // en union av olika objektformer från spreads nedan - annars klagar
  // TypeScript på att t.ex. "city" inte säkert finns med på alla möjliga
  // former av returvärdet.
  const filters: DiscoveryFilters = {};
  if (country) {
    filters.country = country;
  } else if (region) {
    filters.region = region;
  }
  if (city) {
    filters.city = city;
  }
  return filters;
}

export default async function DiscoverPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect({ href: "/login", locale });
    return;
  }

  const filters = parseFilters(await searchParams);

  const [candidates, viewer] = await Promise.all([
    getDiscoveryCandidates(userId, 20, filters),
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

  // TILLAGD 2026-09-21 - samma lookup-mönster som ramarna ovan, för
  // PROFILE_BACKGROUND-varor (se claude/velvetine-status.md).
  const equippedBackgroundIds = candidates
    .map((c) => c.equippedBackgroundId)
    .filter((id): id is string => id !== null);
  const backgroundItems =
    equippedBackgroundIds.length > 0
      ? await prisma.storeItem.findMany({ where: { id: { in: equippedBackgroundIds } } })
      : [];
  const backgroundById = new Map(backgroundItems.map((b) => [b.id, b] as const));

  function equippedBackgroundFor(equippedBackgroundId: string | null): { gradient: string } | null {
    if (!equippedBackgroundId) return null;
    const b = backgroundById.get(equippedBackgroundId);
    return b?.backgroundGradient ? { gradient: b.backgroundGradient } : null;
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
    locationCountry: countryLabel(c.locationCountry, locale),
    relationshipIntent: c.relationshipIntent ? intentLabels[c.relationshipIntent] : null,
    tier: c.tier ? { name: pickLocalized(locale, c.tier.name, c.tier.nameEn, c.tier.nameDe, c.tier.nameEs) } : null,
    tierLevel: c.tier?.level ?? null,
    verified: c.verified,
    equippedFrame: equippedFrameFor(c.equippedFrameId),
    equippedBackground: equippedBackgroundFor(c.equippedBackgroundId),
    blurred: (c.tier?.level ?? 0) > viewerTierLevel && !likedMeIds.has(c.id),
    promptAnswers: c.promptAnswers.map((pa) => ({
      id: pa.id,
      answer: pa.answer,
      prompt: { question: pickLocalized(locale, pa.prompt.question, pa.prompt.questionEn, pa.prompt.questionDe, pa.prompt.questionEs) },
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
      <div className="max-w-md mx-auto">
        <DiscoverFilters
          activeCountry={filters.country ?? null}
          activeRegion={filters.region ?? null}
          activeCity={filters.city ?? null}
        />
      </div>
      <DiscoverDeck initialCandidates={serialized} viewerTierLevel={viewerTierLevel} />
      <div className="max-w-md mx-auto">
        <AppFooter />
      </div>
    </div>
  );
}
