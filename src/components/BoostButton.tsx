"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

// TILLAGD 2026-09-27 (se claude/velvetine-status.md) - måste matcha
// BOOST_CREDIT_COST i src/app/api/profile/boost/credits/route.ts.
const BOOST_CREDIT_COST = 39;

export function BoostButton({
  hasAccess,
  initialBoostedUntil,
  giftCredits: initialGiftCredits = 0,
}: {
  hasAccess: boolean;
  initialBoostedUntil: string | null; // ISO string, serialized from the server
  // TILLAGD 2026-09-27 - saldo för den poäng-baserade boosten nedan. Skickas
  // alltid med (oavsett hasAccess), för den som inte har nivå för den
  // gratis boosten än men vill betala med poäng istället.
  giftCredits?: number;
}) {
  const t = useTranslations("Dashboard");
  const [boostedUntil, setBoostedUntil] = useState(
    initialBoostedUntil ? new Date(initialBoostedUntil) : null
  );
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [giftCredits, setGiftCredits] = useState(initialGiftCredits);

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

  // TILLAGD 2026-09-27 - samma sak, fast betald med poäng istället för
  // gratis nivå-/dygnskvoten. Fungerar oavsett hasAccess/cooldown.
  async function boostWithCredits() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/profile/boost/credits", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Något gick fel.");
      return;
    }
    setBoostedUntil(new Date(data.boostedUntil));
    setGiftCredits((prev) => prev - BOOST_CREDIT_COST);
  }

  if (isActive) {
    const minutesLeft = Math.max(1, Math.ceil((boostedUntil.getTime() - now.getTime()) / 60000));
    return (
      <p className="text-sm text-gold">{t("boostActive", { minutes: minutesLeft })}</p>
    );
  }

  const canAffordCreditsBoost = giftCredits >= BOOST_CREDIT_COST;

  return (
    <div>
      {hasAccess ? (
        <button
          onClick={boost}
          disabled={loading}
          className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
        >
          {t("boostButton")}
        </button>
      ) : (
        <p className="text-xs text-ivory-muted mb-2">{t("boostLocked")}</p>
      )}

      {/* TILLAGD 2026-09-27 - poäng-alternativet visas alltid (även med
          hasAccess), så den som hellre vill betala med poäng än vänta på
          dygns-cooldownen kan göra det direkt. */}
      <div className="mt-2">
        <button
          onClick={boostWithCredits}
          disabled={loading || !canAffordCreditsBoost}
          className="px-4 py-2 rounded-sm text-sm border border-border text-ivory-muted hover:border-gold hover:text-ivory disabled:opacity-40"
        >
          {t("boostWithCredits", { cost: BOOST_CREDIT_COST })}
        </button>
        <p className="text-xs text-ivory-muted mt-1">
          {t("giftCreditsBalance", { count: giftCredits })}
        </p>
      </div>

      {error && <p className="text-xs text-ivory-muted mt-2">{error}</p>}
    </div>
  );
}
