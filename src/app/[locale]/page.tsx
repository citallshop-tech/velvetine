import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Home");
  const c = await getTranslations("Common");

  const dbTiers = await prisma.tier.findMany({ orderBy: { level: "asc" } });
  const intensityByLevel: Record<number, number> = { 1: 0.35, 2: 0.5, 3: 0.68, 4: 0.84, 5: 1 };
  const symbolByLevel: Record<number, string> = { 1: "•", 2: "✦", 3: "✦✦", 4: "♛", 5: "💎" };
  const priceFormatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "sv-SE");

  const TIERS = dbTiers.map((tier) => ({
    name: pickLocalized(locale, tier.name, tier.nameEn),
    intensity: intensityByLevel[tier.level] ?? 0.5,
    symbol: symbolByLevel[tier.level] ?? "",
    priceSek: tier.priceMonthlySek / 100,
    requiresApplication: tier.requiresApplication,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 md:px-16">
        <span className="font-display italic text-xl text-ivory">
          {c("logotype")}
        </span>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-ivory-muted hover:text-ivory transition-colors">
            {t("login")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-8 md:px-16 pt-16 pb-24 max-w-4xl">
          <h1 className="font-display italic text-4xl md:text-6xl leading-tight text-ivory mb-8">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-ivory-muted max-w-xl mb-10 leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/register">
              <Button variant="primary">{t("applyMembership")}</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">{t("alreadyMember")}</Button>
            </Link>
          </div>
        </section>

        {/* Tiers */}
        <section className="px-8 md:px-16 py-20 bg-surface border-y border-border">
          <div className="max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl text-ivory mb-4">
              {t("tiersTitle")}
            </h2>
            <p className="text-ivory-muted max-w-xl mb-12 leading-relaxed">
              {t("tiersSubtitle")}
            </p>
            <div className="flex flex-wrap gap-8">
              {TIERS.map((tier) => (
                <div key={tier.name} className="flex flex-col items-center gap-2 w-24 text-center">
                  <div
                    className="w-14 h-14 rounded-full border border-gold flex items-center justify-center text-ivory"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, var(--color-gold-bright), var(--color-gold) ${
                        40 + tier.intensity * 40
                      }%, var(--color-wine) 100%)`,
                      opacity: 0.55 + tier.intensity * 0.45,
                    }}
                  >
                    <span className="text-ink text-sm">{tier.symbol}</span>
                  </div>
                  <span className="text-sm text-ivory-muted">{tier.name}</span>
                  <span className="text-xs text-gold">
                    {priceFormatter.format(tier.priceSek)} {t("pricePerMonth")}
                  </span>
                  {tier.requiresApplication && (
                    <span className="text-[10px] text-ivory-muted/70">{t("requiresApplication")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-8 md:px-16 py-20 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-ivory mb-12">
            {t("howItWorksTitle")}
          </h2>
          <ol className="space-y-8">
            <li className="flex gap-6">
              <span className="font-display italic text-gold text-2xl leading-none pt-1">1</span>
              <div>
                <h3 className="text-ivory mb-1">{t("step1Title")}</h3>
                <p className="text-ivory-muted leading-relaxed">{t("step1Body")}</p>
              </div>
            </li>
            <li className="flex gap-6">
              <span className="font-display italic text-gold text-2xl leading-none pt-1">2</span>
              <div>
                <h3 className="text-ivory mb-1">{t("step2Title")}</h3>
                <p className="text-ivory-muted leading-relaxed">{t("step2Body")}</p>
              </div>
            </li>
            <li className="flex gap-6">
              <span className="font-display italic text-gold text-2xl leading-none pt-1">3</span>
              <div>
                <h3 className="text-ivory mb-1">{t("step3Title")}</h3>
                <p className="text-ivory-muted leading-relaxed">{t("step3Body")}</p>
              </div>
            </li>
          </ol>
        </section>
      </main>

      <footer className="px-8 md:px-16 py-8 border-t border-border text-sm text-ivory-muted flex items-center justify-between flex-wrap gap-4">
        <span>© {new Date().getFullYear()} {t("copyright")}</span>
        <div className="flex gap-6">
          <Link href="/priser" className="hover:text-ivory">{c("pricingLink")}</Link>
          <Link href="/butik-info" className="hover:text-ivory">{c("storeLink")}</Link>
          <Link href="/villkor" className="hover:text-ivory">{c("terms")}</Link>
          <Link href="/integritetspolicy" className="hover:text-ivory">{c("privacy")}</Link>
          <Link href="/cookies" className="hover:text-ivory">{c("cookies")}</Link>
        </div>
      </footer>
    </div>
  );
}
