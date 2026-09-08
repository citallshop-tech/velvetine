"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface StoreItemData {
  id: string;
  name: string;
  description: string | null;
  priceSek: number;
  frameColor: string;
  frameStyle: string;
  owned: boolean;
  equipped: boolean;
  purchasable: boolean;
}

function FramePreview({ color, style }: { color: string; style: string }) {
  const width = style === "double-glow" ? 6 : 4;
  const glow = style === "double-glow" ? 20 : style === "glow" ? 12 : 0;
  const shadow = [
    `inset 0 0 0 ${width}px ${color}`,
    style === "double-glow" ? `inset 0 0 0 ${width + 3}px ${color}33` : null,
    glow > 0 ? `0 0 ${glow}px ${color}66` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="w-16 h-16 rounded-full bg-surface-raised shrink-0"
      style={{ boxShadow: shadow }}
    />
  );
}

export function StoreItemsList({ items }: { items: StoreItemData[] }) {
  const t = useTranslations("Store");
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function buy(itemId: string) {
    setLoadingId(itemId);
    const res = await fetch("/api/store/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeItemId: itemId }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setLoadingId(null);
  }

  async function toggleEquip(itemId: string, currentlyEquipped: boolean) {
    setLoadingId(itemId);
    await fetch("/api/store/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeItemId: currentlyEquipped ? null : itemId }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`border rounded-sm p-4 flex items-center gap-4 ${
            item.equipped ? "border-gold bg-surface-raised" : "border-border bg-surface"
          }`}
        >
          <FramePreview color={item.frameColor} style={item.frameStyle} />
          <div className="flex-1 min-w-0">
            <p className="text-ivory">{item.name}</p>
            {item.description && <p className="text-xs text-ivory-muted">{item.description}</p>}
            <p className="text-sm text-gold mt-1">
              {item.owned ? (item.equipped ? t("equipped") : t("owned")) : `${item.priceSek} kr`}
            </p>
          </div>

          {item.owned ? (
            <button
              onClick={() => toggleEquip(item.id, item.equipped)}
              disabled={loadingId === item.id}
              className={`px-4 py-2 rounded-sm text-sm border shrink-0 disabled:opacity-50 ${
                item.equipped
                  ? "border-border text-ivory-muted hover:border-gold"
                  : "border-gold text-ivory hover:bg-surface-raised"
              }`}
            >
              {item.equipped ? t("unequip") : t("equip")}
            </button>
          ) : (
            <button
              onClick={() => buy(item.id)}
              disabled={!item.purchasable || loadingId === item.id}
              className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 shrink-0"
            >
              {loadingId === item.id ? t("buying") : t("buy")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
