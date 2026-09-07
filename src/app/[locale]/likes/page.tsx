import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { LikesList } from "@/components/LikesList";

// Tier level 1 ("Ingång"/"Entry") and up - the base paid tier should
// give a real, concrete reason to have paid at all, not just a photo
// frame. This used to require level 2, which left the base tier with
// nothing meaningful of its own.
const MIN_TIER_LEVEL_FOR_LIKES = 1;

export default async function LikesPage({
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

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { tier: true },
  });
  if (!me) {
    redirect({ href: "/login", locale });
    return;
  }

  const t = await getTranslations("Likes");
  const h = await getTranslations("Header");

  const hasAccess = (me.tier?.level ?? 0) >= MIN_TIER_LEVEL_FOR_LIKES;

  if (!hasAccess) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-md mx-auto">
          <AppHeader backHref="/dashboard" />
          <div className="border border-gold rounded-sm bg-surface-raised p-6 text-center">
            <p className="text-ivory mb-2">{t("lockedTitle")}</p>
            <p className="text-sm text-ivory-muted">{t("lockedBody")}</p>
          </div>
          <AppFooter />
        </div>
      </div>
    );
  }

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  const matchedIds = new Set(
    matches.flatMap((m) => [m.userAId, m.userBId]).filter((id) => id !== userId)
  );

  const [blockedByMe, blockingMe] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ]);
  const excludeIds = Array.from(
    new Set<string>([
      ...matchedIds,
      ...blockedByMe.map((b) => b.blockedId),
      ...blockingMe.map((b) => b.blockerId),
    ])
  );

  const incomingLikes = await prisma.swipe.findMany({
    where: {
      toUserId: userId,
      direction: "LIKE",
      fromUserId: { notIn: excludeIds },
      fromUser: { accountStatus: "ACTIVE" },
    },
    include: {
      fromUser: {
        include: {
          tier: true,
          photos: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const people = incomingLikes.map((s) => ({
    userId: s.fromUser.id,
    displayName: s.fromUser.displayName,
    tier: s.fromUser.tier
      ? pickLocalized(locale, s.fromUser.tier.name, s.fromUser.tier.nameEn)
      : null,
    photoUrl: s.fromUser.photos[0]?.url ?? null,
    verified: s.fromUser.verified,
  }));

  await prisma.user.update({
    where: { id: userId },
    data: { lastViewedLikesAt: new Date() },
  });

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <AppHeader
          backHref="/dashboard"
          rightNav={
            <Link href="/discover" className="text-sm text-ivory-muted hover:text-gold">
              {h("browse")}
            </Link>
          }
        />
        <h1 className="font-display text-2xl text-ivory mb-6">{t("title")}</h1>
        <LikesList people={people} />
        <AppFooter />
      </div>
    </div>
  );
}
