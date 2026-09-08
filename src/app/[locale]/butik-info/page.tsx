import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { getSessionUserId } from "@/lib/auth";

export default async function StoreInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("StoreInfo");
  const isLoggedIn = Boolean(await getSessionUserId());

  const items = await prisma.storeItem.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const priceFormatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "sv-SE");

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
              <div
                className="w-12 h-12 rounded-full bg-surface-raised shrink-0"
                style={{ boxShadow: `inset 0 0 0 4px ${item.frameColor}` }}
              />
              <div className="flex-1">
                <p className="text-ivory">{pickLocalized(locale, item.name, item.nameEn)}</p>
                {item.description && <p className="text-xs text-ivory-muted">{item.description}</p>}
              </div>
              <span className="text-gold text-sm shrink-0">
                {priceFormatter.format(item.priceSek / 100)} kr
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
