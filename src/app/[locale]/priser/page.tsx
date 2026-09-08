import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pickLocalized } from "@/lib/localizedField";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

// Perks aren't stored in the database - they're implemented in code
// logic across several files (discovery ranking, incognito route, etc).
// This list is the human-readable summary of that logic, kept here in
// one place so it can be updated deliberately alongside the code that
// implements each perk, rather than drifting out of sync silently.
const PERKS_BY_LEVEL: Record<number, { sv: string[]; en: string[] }> = {
  1: {
    sv: ["Se vem som gillat dig", "Prioriterad synlighet i bläddra-flödet"],
    en: ["See who's liked you", "Priority visibility in the browse feed"],
  },
  2: {
    sv: ["Allt i Ingång", "Inkognitoläge", "Boost - synas överst i 30 min, en gång/dygn"],
    en: ["Everything in Entry", "Incognito mode", "Boost - top of everyone's feed for 30 min, once/day"],
  },
  3: {
    sv: ["Allt i Utvald", "Skarpa sökfilter (dina preferenser filtrerar, inte bara sorterar)", "Läskvitto i chatten"],
    en: ["Everything in Select", "Strict search filters (your preferences filter, not just sort)", "Read receipts in chat"],
  },
  4: {
    sv: ["Allt i Reserverad", "Kräver godkänd ansökan", "Se alla som besökt din profil", "Meddela innan ömsesidig matchning"],
    en: ["Everything in Reserved", "Requires an approved application", "See everyone who's visited your profile", "Message before a mutual match"],
  },
  5: {
    sv: ["Allt i Förstklassig", "Kräver godkänd ansökan", "Högsta prioriterade synlighet", "Mest exklusiva profilram och symbol"],
    en: ["Everything in Premier", "Requires an approved application", "Highest priority visibility", "Most exclusive profile frame and symbol"],
  },
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Pricing");

  const tiers = await prisma.tier.findMany({ orderBy: { level: "asc" } });
  const priceFormatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "sv-SE");

  return (
    <div className="min-h-screen px-8 md:px-16 py-12">
      <AppHeader logoHref="/" backHref="/" />

      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-12">{t("subtitle")}</p>

        <div className="flex flex-col gap-6">
          {tiers.map((tier) => {
            const perks = PERKS_BY_LEVEL[tier.level];
            const perkList = locale === "en" ? perks?.en : perks?.sv;

            return (
              <div key={tier.id} className="border border-border rounded-sm bg-surface p-6">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="text-ivory text-xl">
                    {pickLocalized(locale, tier.name, tier.nameEn)}
                  </h2>
                  <span className="text-gold">
                    {priceFormatter.format(tier.priceMonthlySek / 100)} {t("perMonth")}
                  </span>
                </div>
                {tier.requiresApplication && (
                  <p className="text-xs text-ivory-muted mb-3">{t("requiresApplication")}</p>
                )}
                <ul className="text-sm text-ivory-muted space-y-1 mt-3">
                  {perkList?.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <Link href="/register" className="text-gold hover:text-gold-bright">
            {t("cta")} →
          </Link>
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
