"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function IncognitoToggle({
  initialEnabled,
  hasAccess,
}: {
  initialEnabled: boolean;
  hasAccess: boolean;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!hasAccess || loading) return;
    setLoading(true);
    const next = !enabled;
    const res = await fetch("/api/profile/incognito", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setLoading(false);
    if (res.ok) {
      setEnabled(next);
      router.refresh();
    }
  }

  return (
    <section className="border border-border rounded-sm p-6 bg-surface mb-10">
      <h2 className="text-ivory mb-2">{t("incognitoTitle")}</h2>
      <p className="text-sm text-ivory-muted mb-3">{t("incognitoBody")}</p>
      {hasAccess ? (
        <button
          onClick={toggle}
          disabled={loading}
          className={`px-4 py-2 rounded-sm text-sm border transition-colors disabled:opacity-50 ${
            enabled
              ? "border-gold bg-surface-raised text-gold"
              : "border-border text-ivory-muted hover:border-gold"
          }`}
        >
          {enabled ? t("incognitoOn") : t("incognitoOff")}
        </button>
      ) : (
        <p className="text-xs text-ivory-muted">{t("incognitoLocked")}</p>
      )}
    </section>
  );
}
