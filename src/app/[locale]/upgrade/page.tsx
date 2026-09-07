import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { isStripeConfigured } from "@/lib/stripe";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { TierPicker } from "@/components/TierPicker";

export default async function UpgradePage({
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

  const [user, tiers, applications] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { tier: true } }),
    prisma.tier.findMany({ orderBy: { level: "asc" } }),
    prisma.tierApplication.findMany({
      where: { userId },
      select: { tierId: true, status: true },
    }),
  ]);

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  const t = await getTranslations("Upgrade");
  const applicationByTier = new Map(applications.map((a) => [a.tierId, a.status]));

  const serializedTiers = tiers.map((tier) => ({
    id: tier.id,
    name: pickLocalized(locale, tier.name, tier.nameEn),
    level: tier.level,
    priceSek: tier.priceMonthlySek / 100,
    requiresApplication: tier.requiresApplication,
    applicationStatus: applicationByTier.get(tier.id) ?? null,
    isCurrent: user.tierId === tier.id,
    purchasable: Boolean(tier.stripePriceId),
  }));

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto">
        <AppHeader backHref="/dashboard" />

        <h1 className="font-display text-2xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-8">{t("subtitle")}</p>

        {!isStripeConfigured() && (
          <p className="text-sm text-gold mb-6">{t("notConfigured")}</p>
        )}

        <TierPicker tiers={serializedTiers} hasSubscription={Boolean(user.stripeCustomerId)} />

        <AppFooter />
      </div>
    </div>
  );
}
