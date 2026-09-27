import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { isStripeConfigured } from "@/lib/stripe";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { StoreItemsList } from "@/components/StoreItemsList";
import { GiftCreditPacksList } from "@/components/GiftCreditPacksList";

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

  const [user, items, creditPacks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { storeItemPurchases: { select: { storeItemId: true } } },
    }),
    prisma.storeItem.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    // TILLAGD 2026-09-27 (se claude/velvetine-status.md) - poängpaket för
    // att skicka presenter i chatten.
    prisma.giftCreditPack.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  const t = await getTranslations("Store");
  const ownedIds = new Set(user.storeItemPurchases.map((p) => p.storeItemId));

  const serializedItems = items.map((item) => ({
    id: item.id,
    name: pickLocalized(locale, item.name, item.nameEn, item.nameDe, item.nameEs),
    description: item.description,
    priceSek: item.priceSek / 100,
    category: item.category,
    frameColor: item.frameColor,
    frameStyle: item.frameStyle,
    chatBubbleColor: item.chatBubbleColor,
    chatBackgroundColor: item.chatBackgroundColor,
    // TILLAGD 2026-09-21 - PROFILE_BACKGROUND/DIGITAL_GIFT.
    backgroundGradient: item.backgroundGradient,
    giftEmoji: item.giftEmoji,
    // TILLAGD 2026-09-27 (se claude/velvetine-status.md) - poängkostnad,
    // bara relevant/satt för DIGITAL_GIFT.
    creditCost: item.creditCost,
    owned: ownedIds.has(item.id),
    equipped:
      item.category === "FRAME"
        ? user.equippedFrameId === item.id
        : item.category === "CHAT_THEME"
          ? user.equippedChatThemeId === item.id
          : item.category === "PROFILE_BACKGROUND"
            ? user.equippedBackgroundId === item.id
            : false, // DIGITAL_GIFT - utrustas aldrig, se StoreItemsList.tsx
    purchasable: Boolean(item.stripePriceId),
  }));

  const frameItems = serializedItems.filter((i) => i.category === "FRAME");
  const chatThemeItems = serializedItems.filter((i) => i.category === "CHAT_THEME");
  const backgroundItems = serializedItems.filter((i) => i.category === "PROFILE_BACKGROUND");
  const giftItems = serializedItems.filter((i) => i.category === "DIGITAL_GIFT");

  // TILLAGD 2026-09-27 (se claude/velvetine-status.md).
  const serializedCreditPacks = creditPacks.map((pack) => ({
    id: pack.id,
    name: pickLocalized(locale, pack.name, pack.nameEn, pack.nameDe, pack.nameEs),
    credits: pack.credits,
    priceSek: pack.priceSek / 100,
    purchasable: Boolean(pack.stripePriceId),
  }));

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-lg mx-auto">
        <AppHeader backHref="/dashboard" />

        <h1 className="font-display text-2xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-8">{t("subtitle")}</p>

        {!isStripeConfigured() && <p className="text-sm text-gold mb-6">{t("notConfigured")}</p>}

        <h2 className="text-ivory text-lg mb-3">{t("categoryFrames")}</h2>
        <StoreItemsList items={frameItems} category="FRAME" giftCredits={user.giftCredits} />

        <h2 className="text-ivory text-lg mb-3 mt-10">{t("categoryChatThemes")}</h2>
        <StoreItemsList items={chatThemeItems} category="CHAT_THEME" giftCredits={user.giftCredits} />

        <h2 className="text-ivory text-lg mb-3 mt-10">{t("categoryBackgrounds")}</h2>
        <p className="text-sm text-ivory-muted mb-3">{t("categoryBackgroundsHint")}</p>
        <StoreItemsList items={backgroundItems} category="PROFILE_BACKGROUND" giftCredits={user.giftCredits} />

        <h2 className="text-ivory text-lg mb-3 mt-10">{t("categoryGifts")}</h2>
        <p className="text-sm text-ivory-muted mb-3">{t("categoryGiftsHint")}</p>
        <StoreItemsList items={giftItems} category="DIGITAL_GIFT" />

        {/* TILLAGD 2026-09-27 (se claude/velvetine-status.md) - poäng köps
            här, spenderas i chatten (se ChatThread.tsx). */}
        <h2 className="text-ivory text-lg mb-3 mt-10">{t("categoryCredits")}</h2>
        <p className="text-sm text-ivory-muted mb-1">{t("categoryCreditsHint")}</p>
        <p className="text-sm text-gold mb-3">{t("giftCreditsBalance", { count: user.giftCredits })}</p>
        <GiftCreditPacksList packs={serializedCreditPacks} />

        <AppFooter />
      </div>
    </div>
  );
}
