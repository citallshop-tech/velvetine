"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const t = useTranslations("ResetPassword");
  const c = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? c("genericError"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <p className="text-ivory mb-4">{t("invalidLink")}</p>
          <Link href="/forgot-password" className="text-gold hover:text-gold-bright">
            {t("requestNewLink")}
          </Link>
          <AppFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <AppHeader logoHref="/" />
        <h1 className="font-display text-2xl text-ivory mb-8">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            id="password"
            name="password"
            type="password"
            label={t("newPasswordLabel")}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Field
            id="confirm"
            name="confirm"
            type="password"
            label={t("confirmPasswordLabel")}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error && <p className="text-sm text-gold-bright">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? t("submitLoading") : t("submit")}
          </Button>
        </form>

        <AppFooter />
      </div>
    </div>
  );
}
