"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ResendVerificationButton() {
  const t = useTranslations("EmailVerification");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function resend() {
    setStatus("sending");
    await fetch("/api/auth/resend-verification", { method: "POST" });
    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-sm text-gold">{t("bannerSent")}</p>;
  }

  return (
    <button
      onClick={resend}
      disabled={status === "sending"}
      className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
    >
      {t("bannerResend")}
    </button>
  );
}
