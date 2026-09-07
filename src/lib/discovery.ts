import { prisma } from "@/lib/prisma";

// How much bigger a pool to pull before ranking and trimming to `limit` -
// ranking a pool the same size as what we show would have nothing to
// actually reorder.
const CANDIDATE_POOL_MULTIPLIER = 5;
const MAX_POOL = 150;

function scoreCandidate(
  viewer: {
    prefHeightMin: number | null;
    prefHeightMax: number | null;
    prefBodyTypes: string[];
    prefHairColors: string[];
    locationCountry: string | null;
  },
  candidate: {
    heightCm: number | null;
    bodyType: string | null;
    hairColor: string | null;
    locationCountry: string | null;
    tier: { level: number } | null;
    boostedUntil: Date | null;
  }
): number {
  let score = 0;

  if (candidate.heightCm !== null) {
    const aboveMin = viewer.prefHeightMin === null || candidate.heightCm >= viewer.prefHeightMin;
    const belowMax = viewer.prefHeightMax === null || candidate.heightCm <= viewer.prefHeightMax;
    if ((viewer.prefHeightMin !== null || viewer.prefHeightMax !== null) && aboveMin && belowMax) {
      score += 1;
    }
  }

  if (
    viewer.prefBodyTypes.length > 0 &&
    candidate.bodyType &&
    viewer.prefBodyTypes.includes(candidate.bodyType)
  ) {
    score += 1;
  }

  if (
    viewer.prefHairColors.length > 0 &&
    candidate.hairColor &&
    viewer.prefHairColors.includes(candidate.hairColor)
  ) {
    score += 1;
  }

  // Same country as the viewer - a practical signal, not a demographic
  // preference, so it's weighted a bit higher than the appearance-based
  // ones above: realistically you can only date someone you can meet.
  if (viewer.locationCountry && candidate.locationCountry === viewer.locationCountry) {
    score += 2;
  }

  // Priority visibility - passive, scales with tier.
  score += (candidate.tier?.level ?? 0) * 2;

  // Active boost - a much bigger, temporary spike so it visibly and
  // reliably puts you at the top regardless of tier, since the whole
  // point is it's something you deliberately use, not just a standing
  // trait of your tier.
  if (candidate.boostedUntil && candidate.boostedUntil > new Date()) {
    score += 100;
  }

  return score;
}

// Level 3 ("Reserverad"/"Reserved") and up turns your hidden preferences
// (set on /profile) from a soft ranking signal into a real hard filter -
// only candidates matching every preference you've actually set are
// shown at all, not just bumped higher. Below level 3, the same
// preferences still only influence order (see scoreCandidate above).
const MIN_TIER_LEVEL_FOR_HARD_FILTERS = 3;

function matchesHardFilter(
  viewer: {
    prefHeightMin: number | null;
    prefHeightMax: number | null;
    prefBodyTypes: string[];
    prefHairColors: string[];
  },
  candidate: { heightCm: number | null; bodyType: string | null; hairColor: string | null }
): boolean {
  if (viewer.prefHeightMin !== null || viewer.prefHeightMax !== null) {
    if (candidate.heightCm === null) return false;
    if (viewer.prefHeightMin !== null && candidate.heightCm < viewer.prefHeightMin) return false;
    if (viewer.prefHeightMax !== null && candidate.heightCm > viewer.prefHeightMax) return false;
  }

  if (viewer.prefBodyTypes.length > 0) {
    if (!candidate.bodyType || !viewer.prefBodyTypes.includes(candidate.bodyType)) return false;
  }

  if (viewer.prefHairColors.length > 0) {
    if (!candidate.hairColor || !viewer.prefHairColors.includes(candidate.hairColor)) return false;
  }

  return true;
}

export async function getDiscoveryCandidates(currentUserId: string, limit = 20) {
  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      gender: true,
      seekingGender: true,
      tierVisibilityPrefs: true,
      prefHeightMin: true,
      prefHeightMax: true,
      prefBodyTypes: true,
      prefHairColors: true,
      locationCountry: true,
      tier: { select: { level: true } },
    },
  });
  if (!me) return [];

  // Tiers this user has explicitly turned off - default is visible, so
  // absence of a row means "show me this tier" (opt-out model).
  const hiddenTierIds = me.tierVisibilityPrefs
    .filter((p) => !p.visible)
    .map((p) => p.tierId);

  const [blockedByMe, blockingMe, alreadySwiped] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: currentUserId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: currentUserId }, select: { blockerId: true } }),
    prisma.swipe.findMany({ where: { fromUserId: currentUserId }, select: { toUserId: true } }),
  ]);

  const excludeIds = Array.from(
    new Set<string>([
      currentUserId,
      ...blockedByMe.map((b) => b.blockedId),
      ...blockingMe.map((b) => b.blockerId),
      ...alreadySwiped.map((s) => s.toUserId),
    ])
  );

  const poolSize = Math.min(limit * CANDIDATE_POOL_MULTIPLIER, MAX_POOL);

  // NOTE: if hiddenTierIds is non-empty, users with no tier assigned yet
  // (tierId null - true for everyone until Stripe checkout is wired in)
  // won't match a `notIn` filter due to how SQL handles NULL comparisons,
  // so they'd be silently excluded too. Not an issue today since nobody
  // has tier visibility prefs set yet, but worth knowing once that's used.
  const pool = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      accountStatus: "ACTIVE",
      incognitoMode: false,
      gender: { in: me.seekingGender },
      seekingGender: { has: me.gender },
      tierId: hiddenTierIds.length > 0 ? { notIn: hiddenTierIds } : undefined,
    },
    include: {
      tier: true,
      promptAnswers: { include: { prompt: true }, take: 3, orderBy: { order: "asc" } },
      showcaseItems: { orderBy: { order: "asc" } },
      photos: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
    },
    take: poolSize,
  });

  // Soft ranking, not a hard filter - nobody is excluded from the pool
  // for not matching the viewer's hidden preferences, they just don't
  // get bumped to the front of the line for it.
  const ranked = pool
    .map((candidate) => ({ candidate, score: scoreCandidate(me, candidate) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.candidate);

  const viewerTierLevel = me.tier?.level ?? 0;
  if (viewerTierLevel >= MIN_TIER_LEVEL_FOR_HARD_FILTERS) {
    const filtered = ranked.filter((candidate) => matchesHardFilter(me, candidate));
    // Never show an empty feed just because filters were too strict -
    // fall back to the full soft-ranked pool rather than showing nothing.
    if (filtered.length > 0) {
      return filtered.slice(0, limit);
    }
  }

  return ranked.slice(0, limit);
}
