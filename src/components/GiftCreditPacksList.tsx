"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// TILLAGD 2026-09-27 (se claude/velvetine-status.md) - köp av poängpaket,
// samma sida som Butiken men ett eget litet komponent eftersom paket inte
// har något "ägs"/"utrusta"-läge som StoreItemsList - man kan köpa hur
// många paket som helst, poängen bara läggs på (se User.giftCredits).
interface GiftCreditPackData {
  id: string;
  name: string;
  credits: number;
  priceSek: number;
  purchasable: boolean;
}

export function GiftCreditPacksList({ packs }: { packs: GiftCreditPackData[] }) {
  const t = useTranslations("Store");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function buy(packId: string) {
    setLoadingId(packId);
    const res = await fetch("/api/store/credits/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setLoadingId(null);
  }

  if (packs.length === 0) {
    return <p className="text-sm text-ivory-muted mb-6">{t("noItems")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {packs.map((pack) => (
        <div
          key={pack.id}
          className="border border-border bg-surface rounded-sm p-4 flex items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="text-ivory">{pack.name}</p>
            <p className="text-sm text-gold mt-1">{pack.priceSek} kr</p>
          </div>
          <button
            onClick={() => buy(pack.id)}
            disabled={!pack.purchasable || loadingId === pack.id}
            className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 shrink-0"
          >
            {loadingId === pack.id ? t("buying") : t("buy")}
          </button>
        </div>
      ))}
    </div>
  );
}
