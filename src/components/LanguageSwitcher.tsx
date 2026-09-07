"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALES = [
  { code: "sv", label: "SV" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-xs text-ivory-muted">
      {LOCALES.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">/</span>}
          <button
            onClick={() => router.replace(pathname, { locale: l.code })}
            className={l.code === locale ? "text-gold" : "hover:text-ivory"}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
