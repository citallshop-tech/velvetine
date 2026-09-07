"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

type Status = "verifying" | "success" | "error";

export function VerifyEmailClient({ token }: { token: string | null }) {
  const t = useTranslations("EmailVerification");
  const c = useTranslations("Common");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : t("invalidLink")
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.error ?? c("genericError"));
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage(c("genericError"));
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, c]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <AppHeader logoHref="/" />

        {status === "verifying" && <p className="text-ivory-muted">{t("verifying")}</p>}

        {status === "success" && (
          <>
            <h1 className="font-display text-2xl text-ivory mb-2">{t("successTitle")}</h1>
            <p className="text-ivory-muted mb-8">{t("successBody")}</p>
            <Link href="/dashboard" className="text-gold hover:text-gold-bright">
              {t("goToDashboard")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-display text-2xl text-ivory mb-2">{t("errorTitle")}</h1>
            <p className="text-ivory-muted mb-8">{errorMessage}</p>
            <Link href="/dashboard" className="text-gold hover:text-gold-bright">
              {t("goToDashboard")}
            </Link>
          </>
        )}

        <AppFooter />
      </div>
    </div>
  );
}
