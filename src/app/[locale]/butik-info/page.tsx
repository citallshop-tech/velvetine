import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pickLocalized, localeToIntlTag } from "@/lib/localizedField";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { getSessionUserId } from "@/lib/auth";

// Same reasoning as priser/page.tsx - reads login state per visitor,
// must never be statically cached across different people.
export const dynamic = "force-dynamic";

export default async function StoreInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("StoreInfo");
  const isLoggedIn = Boolean(await getSessionUserId());

  const items = await prisma.storeItem.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const priceFormatter = new Intl.NumberFormat(localeToIntlTag(locale));

  return (
    <div className="min-h-screen px-8 md:px-16 py-12">
      <AppHeader logoHref="/" backHref={isLoggedIn ? "/dashboard" : "/"} />

      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-12">{t("subtitle")}</p>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-sm bg-surface p-4 flex items-center gap-4"
            >
              {/* TILLAGD 2026-09-21 - egen förhandsvisning per kategori,
                  samma idé som StoreItemsList.tsx i inloggade Butiken. */}
              {item.category === "PROFILE_BACKGROUND" ? (
                <div
                  className="w-12 h-12 rounded-sm shrink-0 border border-border/60"
                  style={{ background: item.backgroundGradient ?? "#241c17" }}
                />
              ) : item.category === "DIGITAL_GIFT" ? (
                <div className="w-12 h-12 rounded-sm shrink-0 bg-surface-raised flex items-center justify-center text-xl">
                  {item.giftEmoji ?? "🎁"}
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-surface-raised shrink-0"
                  style={{ boxShadow: `inset 0 0 0 4px ${item.frameColor}` }}
                />
              )}
              <div className="flex-1">
                <p className="text-ivory">
                  {pickLocalized(locale, item.name, item.nameEn, item.nameDe, item.nameEs)}
                </p>
                {item.description && <p className="text-xs text-ivory-muted">{item.description}</p>}
              </div>
              {/* RÄTTAD 2026-09-27 (se claude/velvetine-status.md) - den här
                  sidan visade tidigare alltid `priceSek/100 kr`, oavsett
                  kategori. Det blev missvisande sedan poängsystemet infördes:
                  DIGITAL_GIFT har inget kronor-pris längre alls (priceSek är
                  oanvänt, bara creditCost gäller - de kan bara köpas med
                  poäng i chatten), och FRAME/CHAT_THEME/PROFILE_BACKGROUND
                  nämnde aldrig poäng-alternativet som "riktiga" Butiken
                  (StoreItemsList.tsx) redan visar. Visar nu rätt pris per
                  kategori istället för att alltid anta ett kronor-pris. */}
              <span className="text-gold text-sm shrink-0 text-right">
                {item.category === "DIGITAL_GIFT" ? (
                  t("giftCreditCost", { count: item.creditCost ?? 0 })
                ) : (
                  <>
                    {priceFormatter.format(item.priceSek / 100)} kr
                    {item.creditCost != null && (
                      <>
                        <br />
                        <span className="text-xs text-ivory-muted">
                          {t("orCredits", { count: item.creditCost })}
                        </span>
                      </>
                    )}
                  </>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href={isLoggedIn ? "/store" : "/login"} className="text-gold hover:text-gold-bright">
            {isLoggedIn ? t("ctaLoggedIn") : t("cta")} →
          </Link>
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
