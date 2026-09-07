"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message ?? t("defaultMessage"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <AppHeader logoHref="/" />
        <h1 className="font-display text-2xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-8">{t("subtitle")}</p>

        {message ? (
          <p className="text-ivory">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field id="email" name="email" type="email" label={t("emailLabel")} autoComplete="email" required />
            <Button type="submit" disabled={loading}>
              {loading ? t("submitLoading") : t("submit")}
            </Button>
          </form>
        )}

        <p className="text-sm text-ivory-muted mt-8">
          <Link href="/login" className="text-gold hover:text-gold-bright">
            {t("backToLogin")}
          </Link>
        </p>

        <AppFooter />
      </div>
    </div>
  );
}
