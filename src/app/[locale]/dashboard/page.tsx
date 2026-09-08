import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reactivateIfExpired } from "@/lib/suspension";
import { pickLocalized } from "@/lib/localizedField";
import { LogoutButton, DeleteAccountButton } from "@/components/AccountActions";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { IncognitoToggle } from "@/components/IncognitoToggle";
import { NotificationToggle } from "@/components/NotificationToggle";
import { BoostButton } from "@/components/BoostButton";
import { UpdatePaymentButton } from "@/components/UpdatePaymentButton";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";
import { NavBadge } from "@/components/NavBadge";
import { getUnreadMatchesCount, getNewLikesCount } from "@/lib/unread";

// Matches src/app/api/profile/incognito/route.ts - keep these in sync.
const MIN_TIER_LEVEL_FOR_INCOGNITO = 2;
const MIN_TIER_LEVEL_FOR_HARD_FILTERS = 3;
const MIN_TIER_LEVEL_FOR_BOOST = 2;

export default async function DashboardPage({
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

  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tier: true },
  });

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  user = await reactivateIfExpired(user);

  if (user.accountStatus !== "ACTIVE") {
    redirect({ href: "/login", locale });
    return;
  }

  const t = await getTranslations("Dashboard");
  const h = await getTranslations("Header");
  const e = await getTranslations("EmailVerification");
  const u = await getTranslations("Upgrade");

  const [unreadMatches, newLikes] = await Promise.all([
    getUnreadMatchesCount(userId),
    getNewLikesCount(userId),
  ]);

  return (
    <div className="min-h-screen px-8 md:px-16 py-12">
      <AppHeader
        rightNav={
          <>
            <Link href="/discover" className="text-sm text-ivory-muted hover:text-gold">
              {h("browse")}
            </Link>
            <Link href="/matches" className="text-sm text-ivory-muted hover:text-gold flex items-center">
              {h("matches")}
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
            {user.isAdmin && (
              <Link href="/admin" className="text-sm text-gold hover:text-gold-bright">
                {h("admin")}
              </Link>
            )}
            <LogoutButton />
          </>
        }
      />

      <main className="max-w-2xl">
        {user.subscriptionStatus === "PAST_DUE" && (
          <div className="border border-gold-bright rounded-sm bg-surface-raised p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-ivory">{u("paymentFailedTitle")}</p>
              <p className="text-xs text-ivory-muted mt-1">{u("paymentFailedBody")}</p>
            </div>
            <UpdatePaymentButton />
          </div>
        )}

        {!user.emailVerified && (
          <div className="border border-gold rounded-sm bg-surface-raised p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-ivory">{e("bannerText")}</p>
            <ResendVerificationButton />
          </div>
        )}

        <h1 className="font-display text-3xl text-ivory mb-2">
          {t("greeting", { name: user.displayName })}
        </h1>
        <p className="text-ivory-muted mb-10">{user.email}</p>

        <section className="border border-border rounded-sm p-6 bg-surface mb-10">
          <h2 className="text-ivory mb-2">{t("tierSectionTitle")}</h2>
          {user.tier ? (
            <p className="text-gold mb-3">{pickLocalized(locale, user.tier.name, user.tier.nameEn)}</p>
          ) : (
            <p className="text-ivory-muted mb-3">{t("noTier")}</p>
          )}
          <Link href="/upgrade" className="text-sm text-gold hover:text-gold-bright">
            {t("upgradeLink")} →
          </Link>
          <br />
          <Link href="/store" className="text-sm text-gold hover:text-gold-bright">
            {t("storeLink")} →
          </Link>
        </section>

        <section className="mb-10">
          <Link href="/profile" className="text-gold hover:text-gold-bright">
            {t("editProfile")} →
          </Link>
        </section>

        <IncognitoToggle
          initialEnabled={user.incognitoMode}
          hasAccess={(user.tier?.level ?? 0) >= MIN_TIER_LEVEL_FOR_INCOGNITO}
        />

        <NotificationToggle />

        <section className="border border-border rounded-sm p-6 bg-surface mb-10">
          <h2 className="text-ivory mb-2">{t("boostTitle")}</h2>
          <p className="text-sm text-ivory-muted mb-3">{t("boostBody")}</p>
          <BoostButton
            hasAccess={(user.tier?.level ?? 0) >= MIN_TIER_LEVEL_FOR_BOOST}
            initialBoostedUntil={user.boostedUntil?.toISOString() ?? null}
          />
        </section>

        {(user.tier?.level ?? 0) >= MIN_TIER_LEVEL_FOR_HARD_FILTERS && (
          <section className="border border-border rounded-sm p-6 bg-surface mb-10">
            <h2 className="text-ivory mb-2">{t("hardFiltersTitle")}</h2>
            <p className="text-sm text-ivory-muted mb-3">{t("hardFiltersBody")}</p>
            <Link href="/profile" className="text-sm text-gold hover:text-gold-bright">
              {t("hardFiltersLink")}
            </Link>
          </section>
        )}

        <section className="flex flex-col gap-4 items-start">
          <DeleteAccountButton />
        </section>

        <AppFooter />
      </main>
    </div>
  );
}
