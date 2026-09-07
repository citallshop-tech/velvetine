"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("Register");
  const c = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seekingGender, setSeekingGender] = useState<string[]>([]);
  const [consentSpecialCategory, setConsentSpecialCategory] = useState(false);

  const GENDER_OPTIONS = [
    { value: "WOMAN", label: t("genderWoman") },
    { value: "MAN", label: t("genderMan") },
    { value: "NONBINARY", label: t("genderNonbinary") },
    { value: "OTHER", label: t("genderOther") },
  ] as const;

  function toggleSeeking(value: string) {
    setSeekingGender((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);

    if (seekingGender.length === 0) {
      setError(t("errorSeekingRequired"));
      return;
    }

    if (!consentSpecialCategory) {
      setError(t("errorConsentRequired"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        displayName: form.get("displayName"),
        birthDate: form.get("birthDate"),
        gender: form.get("gender"),
        seekingGender,
        consentSpecialCategory,
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
        <h1 className="font-display text-2xl text-ivory mb-2">{t("title")}</h1>
        <p className="text-ivory-muted mb-8">{t("subtitle")}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            id="displayName"
            name="displayName"
            label={t("nameLabel")}
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Field
            id="birthDate"
            name="birthDate"
            type="date"
            label={t("birthDateLabel")}
            required
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="gender" className="text-sm text-ivory-muted">
              {t("genderLabel")}
            </label>
            <select
              id="gender"
              name="gender"
              required
              className="bg-surface border border-border rounded-sm px-4 py-3 text-ivory focus:outline-none focus:border-gold transition-colors"
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-ivory-muted">{t("seekingLabel")}</span>
            <div className="flex flex-wrap gap-3">
              {GENDER_OPTIONS.map((opt) => {
                const active = seekingGender.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleSeeking(opt.value)}
                    className={`px-4 py-2 rounded-sm text-sm border transition-colors ${
                      active
                        ? "border-gold bg-surface-raised text-ivory"
                        : "border-border text-ivory-muted hover:border-gold"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-gold-bright">{error}</p>}

          <label className="flex items-start gap-3 text-xs text-ivory-muted">
            <input
              type="checkbox"
              checked={consentSpecialCategory}
              onChange={(e) => setConsentSpecialCategory(e.target.checked)}
              className="mt-0.5"
            />
            <span>{t("consentText")}</span>
          </label>

          <p className="text-xs text-ivory-muted">
            {t.rich("termsAcknowledgement", {
              terms: (chunks) => (
                <Link href="/villkor" className="text-gold hover:text-gold-bright">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/integritetspolicy" className="text-gold hover:text-gold-bright">
                  {chunks}
                </Link>
              ),
            })}
          </p>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? t("submitLoading") : t("submit")}
          </Button>
        </form>

        <p className="text-sm text-ivory-muted mt-8">
          {t("alreadyMember")}{" "}
          <Link href="/login" className="text-gold hover:text-gold-bright">
            {t("login")}
          </Link>
        </p>

        <AppFooter />
      </div>
    </div>
  );
}
