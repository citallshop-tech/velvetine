"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export type StoreCategory = "FRAME" | "CHAT_THEME" | "PROFILE_BACKGROUND" | "DIGITAL_GIFT";

interface StoreItemData {
  id: string;
  name: string;
  description: string | null;
  priceSek: number;
  category: StoreCategory;
  frameColor: string;
  frameStyle: string;
  chatBubbleColor: string | null;
  chatBackgroundColor: string | null;
  backgroundGradient: string | null;
  giftEmoji: string | null;
  // TILLAGD 2026-09-27 (se claude/velvetine-status.md) - bara satt för
  // DIGITAL_GIFT. priceSek/owned/equipped/purchasable är oanvända för den
  // kategorin sedan presenter slutade vara en engångsköpt ägodel - se
  // grenen längst ner i denna fil.
  // Poängkostnad. För DIGITAL_GIFT: vad det kostar att SKICKA presenten
  // (se grenen längst ner i den här filen). ÄNDRAD 2026-09-27 (andra
  // passet): för FRAME/CHAT_THEME/PROFILE_BACKGROUND betyder det istället
  // att varan går att lösa in med poäng som ett ALTERNATIV till att köpa
  // med kronor - se giftCredits-propen nedan och knappen "Köp med poäng".
  creditCost: number | null;
  owned: boolean;
  equipped: boolean;
  purchasable: boolean;
}

// TILLAGD 2026-09-21 - vilka kategorier man "tar på sig" (en i taget, kan
// ta av) kontra bara äger och använder på annat sätt. DIGITAL_GIFT hör
// till den andra gruppen - se kommentaren vid CATEGORIES i equip/route.ts.
const EQUIPPABLE_CATEGORIES: StoreCategory[] = ["FRAME", "CHAT_THEME", "PROFILE_BACKGROUND"];

function FramePreview({ color, style }: { color: string; style: string }) {
  const width = style === "double-glow" ? 6 : 4;
  const glow = style === "double-glow" ? 20 : style === "glow" || style === "shimmer" ? 12 : 0;
  const shadow = [
    `inset 0 0 0 ${width}px ${color}`,
    style === "double-glow" ? `inset 0 0 0 ${width + 3}px ${color}33` : null,
    glow > 0 ? `0 0 ${glow}px ${color}66` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`w-16 h-16 rounded-full bg-surface-raised shrink-0 ${
        style === "shimmer" ? "animate-frame-shimmer" : ""
      }`}
      style={{ boxShadow: shadow }}
    />
  );
}

function ChatThemePreview({
  bubbleColor,
  backgroundColor,
}: {
  bubbleColor: string;
  backgroundColor: string;
}) {
  return (
    <div
      className="w-16 h-16 rounded-sm shrink-0 flex items-center justify-center p-1.5"
      style={{ backgroundColor }}
    >
      <div className="w-full h-3 rounded-sm" style={{ backgroundColor: bubbleColor }} />
    </div>
  );
}

// TILLAGD 2026-09-21 - förhandsvisning för de två nya kategorierna.
function BackgroundPreview({ gradient }: { gradient: string }) {
  return (
    <div
      className="w-16 h-16 rounded-sm shrink-0 border border-border/60"
      style={{ background: gradient }}
    />
  );
}

function GiftPreview({ emoji }: { emoji: string }) {
  return (
    <div className="w-16 h-16 rounded-sm shrink-0 bg-surface-raised flex items-center justify-center text-3xl">
      {emoji}
    </div>
  );
}

export function StoreItemsList({
  items,
  category,
  giftCredits = 0,
}: {
  items: StoreItemData[];
  category: StoreCategory;
  // TILLAGD 2026-09-27 (andra passet) - saldo, för "Köp med poäng"-knappen
  // nedan. Oanvänd för DIGITAL_GIFT-listan (den har ingen köpknapp alls).
  giftCredits?: number;
}) {
  const t = useTranslations("Store");
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  // TILLAGD 2026-09-21 - kunden måste uttryckligen bekräfta pris/vara och
  // villkoren (inkl. att ångerrätten faller bort vid digitalt innehåll som
  // levereras direkt) innan köpknappen går att klicka på. Ren
  // frontend-spärr - rör inte checkout/route.ts eller något Stripe-anrop.
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  function toggleConfirm(itemId: string) {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

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

  // TILLAGD 2026-09-27 (andra passet, se claude/velvetine-status.md) -
  // alternativ till buy() ovan: löser in varan med poäng istället för att
  // gå via Stripe. router.refresh() efteråt hämtar om ownership/saldo från
  // servern, samma mönster som toggleEquip redan gör.
  async function redeemWithCredits(itemId: string) {
    setLoadingId(itemId);
    setRedeemError(null);
    const res = await fetch("/api/store/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeItemId: itemId }),
    });
    const data = await res.json().catch(() => null);
    setLoadingId(null);
    if (!res.ok) {
      setRedeemError(data?.error ?? t("redeemFailed"));
      return;
    }
    router.refresh();
  }

  async function toggleEquip(itemId: string, currentlyEquipped: boolean) {
    setLoadingId(itemId);
    await fetch("/api/store/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeItemId: currentlyEquipped ? null : itemId, category }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="text-sm text-ivory-muted mb-6">{t("noItems")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {redeemError && <p className="text-xs text-ivory-muted">{redeemError}</p>}
      {items.map((item) => {
        // ÄNDRAD 2026-09-27 (se claude/velvetine-status.md): DIGITAL_GIFT är
        // sedan poängsystemet infördes ett rent katalogobjekt här - ingen
        // köp/äg/utrusta-knapp alls, bara en förhandsvisning av vad
        // presenten kostar att SKICKA (i poäng, i chatten). Egen, enklare
        // gren istället för att vira in fler specialfall i den vanliga
        // köp/utrusta-grenen nedan.
        if (item.category === "DIGITAL_GIFT") {
          return (
            <div key={item.id} className="border border-border bg-surface rounded-sm p-4 flex items-center gap-4">
              <GiftPreview emoji={item.giftEmoji ?? "🎁"} />
              <div className="flex-1 min-w-0">
                <p className="text-ivory">{item.name}</p>
                {item.description && <p className="text-xs text-ivory-muted">{item.description}</p>}
              </div>
              <span className="px-4 py-2 text-sm text-gold shrink-0">
                {t("giftCreditCost", { count: item.creditCost ?? 0 })}
              </span>
            </div>
          );
        }

        const isEquippable = EQUIPPABLE_CATEGORIES.includes(item.category);
        // TILLAGD 2026-09-21 - köpknappen kräver att kunden bekräftat
        // pris/vara + villkoren (se checkboxen nedan) för varor som inte
        // redan ägs. Utrustningsknappen (för redan ägda varor) berörs inte.
        const needsConfirmation = !item.owned;
        const confirmed = confirmedIds.has(item.id);

        return (
          <div
            key={item.id}
            className={`border rounded-sm p-4 flex flex-col gap-3 ${
              item.equipped ? "border-gold bg-surface-raised" : "border-border bg-surface"
            }`}
          >
            <div className="flex items-center gap-4">
              {item.category === "FRAME" && (
                <FramePreview color={item.frameColor} style={item.frameStyle} />
              )}
              {item.category === "CHAT_THEME" && (
                <ChatThemePreview
                  bubbleColor={item.chatBubbleColor ?? "#5a2f3f"}
                  backgroundColor={item.chatBackgroundColor ?? "#15100d"}
                />
              )}
              {item.category === "PROFILE_BACKGROUND" && (
                <BackgroundPreview gradient={item.backgroundGradient ?? "#241c17"} />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-ivory">{item.name}</p>
                {item.description && <p className="text-xs text-ivory-muted">{item.description}</p>}
                <p className="text-sm text-gold mt-1">
                  {item.owned ? (item.equipped ? t("equipped") : t("owned")) : `${item.priceSek} kr`}
                </p>
              </div>

              {isEquippable && item.owned ? (
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
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  <button
                    onClick={() => buy(item.id)}
                    disabled={!item.purchasable || !confirmed || loadingId === item.id}
                    className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
                  >
                    {loadingId === item.id ? t("buying") : t("buy")}
                  </button>
                  {/* TILLAGD 2026-09-27 (andra passet) - poäng-alternativet,
                      bara för varor som faktiskt har en poängkostnad satt
                      (item.creditCost). Kräver samma bekräftelsekryssruta
                      som kronor-köpet ovan. */}
                  {item.creditCost != null && (
                    <button
                      onClick={() => redeemWithCredits(item.id)}
                      disabled={!confirmed || giftCredits < item.creditCost || loadingId === item.id}
                      className="px-4 py-2 rounded-sm text-xs border border-border text-ivory-muted hover:border-gold hover:text-ivory disabled:opacity-40"
                    >
                      {t("redeemWithCredits", { cost: item.creditCost })}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* RÄTTAD 2026-09-27 (fjärde passet, se claude/velvetine-status.md) -
                kryssrutan visades tidigare bara när item.purchasable (dvs.
                bara när ett riktigt Stripe-pris fanns) - det gjorde att en
                vara utan Stripe-pris men MED poängpris (t.ex. Onyx/Pärlvit/
                bakgrunderna, aktiverade för poäng-köp innan Stripe var
                tillbaka) aldrig visade kryssrutan alls, vilket i sin tur
                gjorde att "confirmed" aldrig kunde bli sant och därmed
                blockerade även "Lös in för poäng"-knappen helt i onödan.
                Visar nu kryssrutan så fort NÅGOT köpsätt finns (kronor
                ELLER poäng). */}
            {needsConfirmation && (item.purchasable || item.creditCost != null) && (
              <label className="flex items-start gap-2 text-xs text-ivory-muted pl-1">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={() => toggleConfirm(item.id)}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  {t("confirmPurchase")}{" "}
                  <Link href="/villkor" target="_blank" className="underline hover:text-gold">
                    {t("termsLinkLabel")}
                  </Link>
                </span>
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}
