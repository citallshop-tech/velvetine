import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

// Premier ("Förstklassig") and up - a more complete view than "who liked
// you" (Entry tier): everyone who's seen your card, not just the ones
// who liked it.
const MIN_TIER_LEVEL_FOR_VISITORS = 4;

export default async function VisitorsPage({
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

  const t = await getTranslations("Visitors");
  const h = await getTranslations("Header");

  const hasAccess = (me.tier?.level ?? 0) >= MIN_TIER_LEVEL_FOR_VISITORS;

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

  const [blockedByMe, blockingMe] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ]);
  const excludeIds = Array.from(
    new Set<string>([...blockedByMe.map((b) => b.blockedId), ...blockingMe.map((b) => b.blockerId)])
  );

  const visits = await prisma.swipe.findMany({
    where: {
      toUserId: userId,
      fromUserId: { notIn: excludeIds },
      fromUser: { accountStatus: "ACTIVE" },
    },
    include: { fromUser: { include: { tier: true, photos: { where: { isPrimary: true }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
    distinct: ["fromUserId"],
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

        <div className="flex flex-col gap-3">
          {visits.map((visit) => (
            <Link
              key={visit.id}
              href={`/u/${visit.fromUser.id}`}
              className="border border-border rounded-sm bg-surface p-4 flex items-center gap-4 hover:border-gold transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center shrink-0 overflow-hidden">
                {visit.fromUser.photos[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
                  <img
                    src={visit.fromUser.photos[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display italic text-gold">
                    {visit.fromUser.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ivory">
                  {visit.fromUser.displayName}
                  {visit.fromUser.verified && <span className="text-gold ml-1">✓</span>}
                </p>
                {visit.fromUser.tier && (
                  <p className="text-xs text-gold">
                    {pickLocalized(locale, visit.fromUser.tier.name, visit.fromUser.tier.nameEn)}
                  </p>
                )}
              </div>
              {visit.direction === "LIKE" && (
                <span className="text-xs text-gold shrink-0">{t("likedYou")}</span>
              )}
            </Link>
          ))}

          {visits.length === 0 && (
            <p className="text-ivory-muted text-center py-12">{t("empty")}</p>
          )}
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
