"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "NONE" | "PENDING" | "VERIFIED" | "FAILED";

export function VerificationUpload({ initialStatus }: { initialStatus: Status }) {
  const t = useTranslations("Profile");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/verification-selfie", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Något gick fel.");
      return;
    }
    setStatus(data.status);
  }

  return (
    <div>
      {status === "VERIFIED" && <p className="text-sm text-gold mb-2">{t("verificationVerified")}</p>}
      {status === "PENDING" && (
        <p className="text-sm text-ivory-muted mb-2">{t("verificationPending")}</p>
      )}
      {status === "FAILED" && (
        <p className="text-sm text-ivory-muted mb-2">{t("verificationFailed")}</p>
      )}
      {error && <p className="text-sm text-ivory-muted mb-2">{error}</p>}

      <label className="inline-block px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised cursor-pointer">
        <input type="file" accept="image/*" onChange={handleFileSelected} className="hidden" />
        {uploading ? t("verificationUploading") : t("verificationUpload")}
      </label>
    </div>
  );
}
