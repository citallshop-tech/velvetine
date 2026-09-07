"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function BoostButton({
  hasAccess,
  initialBoostedUntil,
}: {
  hasAccess: boolean;
  initialBoostedUntil: string | null; // ISO string, serialized from the server
}) {
  const t = useTranslations("Dashboard");
  const [boostedUntil, setBoostedUntil] = useState(
    initialBoostedUntil ? new Date(initialBoostedUntil) : null
  );
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isActive = boostedUntil !== null && boostedUntil > now;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  async function boost() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/profile/boost", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Något gick fel.");
      return;
    }
    setBoostedUntil(new Date(data.boostedUntil));
  }

  if (!hasAccess) {
    return <p className="text-xs text-ivory-muted">{t("boostLocked")}</p>;
  }

  if (isActive) {
    const minutesLeft = Math.max(1, Math.ceil((boostedUntil.getTime() - now.getTime()) / 60000));
    return (
      <p className="text-sm text-gold">{t("boostActive", { minutes: minutesLeft })}</p>
    );
  }

  return (
    <div>
      <button
        onClick={boost}
        disabled={loading}
        className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
      >
        {t("boostButton")}
      </button>
      {error && <p className="text-xs text-ivory-muted mt-2">{error}</p>}
    </div>
  );
}
