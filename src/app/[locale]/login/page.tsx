"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Login");
  const c = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
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

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <AppHeader logoHref="/" />
        <h1 className="font-display text-2xl text-ivory mb-8">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            id="email"
            name="email"
            type="email"
            label={t("emailLabel")}
            autoComplete="email"
            required
          />
          <Field
            id="password"
            name="password"
            type="password"
            label={t("passwordLabel")}
            autoComplete="current-password"
            required
          />
          <Link href="/forgot-password" className="text-sm text-ivory-muted hover:text-gold-bright -mt-2">
            {t("forgotPassword")}
          </Link>

          {error && <p className="text-sm text-gold-bright">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? t("submitLoading") : t("submit")}
          </Button>
        </form>

        <p className="text-sm text-ivory-muted mt-8">
          {t("notMemberYet")}{" "}
          <Link href="/register" className="text-gold hover:text-gold-bright">
            {t("applyMembership")}
          </Link>
        </p>

        <AppFooter />
      </div>
    </div>
  );
}
