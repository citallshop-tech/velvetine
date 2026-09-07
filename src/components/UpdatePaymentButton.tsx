"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function UpdatePaymentButton() {
  const t = useTranslations("Upgrade");
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setLoading(false);
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 shrink-0"
    >
      {t("updatePayment")}
    </button>
  );
}
