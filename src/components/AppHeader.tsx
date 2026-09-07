import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AppHeader({
  logoHref = "/dashboard",
  backHref,
  backLabel,
  rightNav,
}: {
  logoHref?: string;
  backHref?: string;
  backLabel?: string;
  rightNav?: React.ReactNode;
}) {
  const t = useTranslations("Common");

  return (
    <header className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-4">
        <Link href={logoHref} className="font-display italic text-xl text-ivory">
          {t("logotype")}
        </Link>
        {backHref && (
          <Link href={backHref} className="text-sm text-ivory-muted hover:text-gold">
            ← {backLabel ?? t("back")}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-6">
        {rightNav && <nav className="flex items-center gap-6">{rightNav}</nav>}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
