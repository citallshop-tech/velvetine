import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { isStripeConfigured } from "@/lib/stripe";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { StoreItemsList } from "@/components/StoreItemsList";

export default async function StorePage({
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

  const [user, items] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { storeItemPurchases: { select: { storeItemId: true } } },
    }),
    prisma.storeItem.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  const t = await getTranslations("Store");
  const ownedIds = new Set(user.storeItemPurchases.map((p) => p.storeItemId));

  const serializedItems = items.map((item) => ({
    id: item.id,
    name: pickLocalized(locale, item.name, item.nameEn),
    description: item.description,
    priceSek: item.priceSek / 100,
    frameColor: item.frameColor,
    frameStyle: item.frameStyle,
    owned: ownedIds.has(item.id),
    equipped: user.equippedFrameId === item.id,
    purchasable: Boolean(item.stripePriceId),
  }));

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto">
        <AppHeader backHref="/dashboard" />

        <h1 className="font-display text-2xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-8">{t("subtitle")}</p>

        {!isStripeConfigured() && <p className="text-sm text-gold mb-6">{t("notConfigured")}</p>}

        <StoreItemsList items={serializedItems} />

        <AppFooter />
      </div>
    </div>
  );
}
