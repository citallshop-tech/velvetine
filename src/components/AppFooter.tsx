"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { reopenCookieConsent } from "@/components/CookieConsentBanner";

export function AppFooter() {
  const t = useTranslations("Common");

  return (
    <footer className="mt-16 pt-6 border-t border-border text-xs text-ivory-muted flex flex-wrap gap-6">
      <Link href="/priser" className="hover:text-ivory">{t("pricingLink")}</Link>
      <Link href="/butik-info" className="hover:text-ivory">{t("storeLink")}</Link>
      <Link href="/villkor" className="hover:text-ivory">{t("terms")}</Link>
      <Link href="/integritetspolicy" className="hover:text-ivory">{t("privacy")}</Link>
      <Link href="/cookies" className="hover:text-ivory">{t("cookies")}</Link>
      <button onClick={reopenCookieConsent} className="hover:text-ivory">
        {t("cookieSettings")}
      </button>
    </footer>
  );
}
