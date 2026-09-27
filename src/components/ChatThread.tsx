"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const POLL_INTERVAL_MS = 3000;
// TILLAGD 2026-09-27 (andra passet samma dag, se claude/velvetine-status.md)
// - måste matcha MESSAGE_HIGHLIGHT_CREDIT_COST i
// src/app/api/matches/[matchId]/messages/route.ts.
const MESSAGE_HIGHLIGHT_CREDIT_COST = 10;

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  // TILLAGD 2026-09-21 - digitala presenter (se claude/velvetine-status.md).
  giftEmoji?: string | null;
  senderId: string;
  createdAt: string;
  // TILLAGD 2026-09-27 (andra passet) - "lyft"/markerat meddelande, se
  // Message.highlighted i schema.prisma.
  highlighted?: boolean;
}

interface GiftOption {
  id: string;
  emoji: string;
  name: string;
  // TILLAGD 2026-09-27 (se claude/velvetine-status.md) - poängkostnad att
  // skicka den HÄR presenten en gång. Presenter ägs inte längre - alla
  // aktiva presenter visas alltid, kostnaden avgör om man har råd just nu.
  creditCost: number;
}

export function ChatThread({
  matchId,
  currentUserId,
  initialMessages,
  isActive: initialIsActive,
  hasReadReceipts = false,
  otherLastReadAt: initialOtherLastReadAt = null,
  chatTheme = null,
  gifts = [],
  giftCredits: initialGiftCredits = 0,
}: {
  matchId: string;
  currentUserId: string;
  initialMessages: Message[];
  isActive: boolean;
  hasReadReceipts?: boolean;
  otherLastReadAt?: string | null;
  chatTheme?: { bubbleColor: string; backgroundColor: string } | null;
  gifts?: GiftOption[];
  giftCredits?: number;
}) {
  const t = useTranslations("Chat");
  const [messages, setMessages] = useState(initialMessages);
  const [otherLastReadAt, setOtherLastReadAt] = useState(initialOtherLastReadAt);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [giftPickerOpen, setGiftPickerOpen] = useState(false);
  const [giftCredits, setGiftCredits] = useState(initialGiftCredits);
  const [giftError, setGiftError] = useState<string | null>(null);
  // TILLAGD 2026-09-27 (andra passet) - "lyft det här meddelandet"-växeln,
  // gäller bara nästa vanliga text-/bildmeddelande, aldrig en gåva.
  const [highlightNext, setHighlightNext] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setMounted(true), []);

  // Polling instead of a manual refresh button - checks for new
  // messages and updated read receipts every few seconds. Plain
  // polling rather than websockets since this runs on Vercel's
  // serverless functions, which don't hold persistent connections.
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/matches/${matchId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      setOtherLastReadAt(data.otherLastReadAt);
      setIsActive(data.isActive);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [matchId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || sending) return;

    setGiftError(null);
    setSending(true);
    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, highlight: highlightNext }),
    });
    setSending(false);

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText("");
      // TILLAGD 2026-09-27 (andra passet) - lokal, optimistisk uppdatering
      // av saldot, precis som sendGift redan gör. Servern är alltid den
      // faktiska sanningskällan (nästa poll hämtar om exakt saldo ändå).
      if (highlightNext) setGiftCredits((prev) => prev - MESSAGE_HIGHLIGHT_CREDIT_COST);
      setHighlightNext(false);
    } else {
      // TILLAGD 2026-09-27 - fanns ingen felhantering här innan (ett
      // misslyckat skickande försvann tyst). Framför allt viktigt nu när
      // ett highlight-försök kan avslås pga för lågt poängsaldo (402).
      const data = await res.json().catch(() => null);
      setGiftError(data?.error ?? t("messageSendFailed"));
    }
  }

  // ÄNDRAD 2026-09-27 (se claude/velvetine-status.md) - skicka en present
  // drar nu poäng varje gång (servern gör det atomärt och är den enda
  // sanningskällan för saldot - den lokala giftCredits-uppdateringen här är
  // bara en optimistisk snabb uppdatering av siffran i UI:t).
  async function sendGift(gift: GiftOption) {
    if (sending) return;
    setGiftError(null);
    setGiftPickerOpen(false);
    setSending(true);
    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftStoreItemId: gift.id }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setGiftCredits((prev) => prev - gift.creditCost);
    } else {
      const data = await res.json().catch(() => null);
      setGiftError(data?.error ?? t("giftFailed"));
    }
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow selecting the same file again later
    if (!file || sending) return;

    setUploadError(null);
    setSending(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch(`/api/matches/${matchId}/upload-image`, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      setUploadError(uploadData.error ?? t("imageUploadFailed"));
      setSending(false);
      return;
    }

    const messageRes = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: uploadData.url, highlight: highlightNext }),
    });
    setSending(false);

    if (messageRes.ok) {
      const data = await messageRes.json();
      setMessages((prev) => [...prev, data.message]);
      if (highlightNext) setGiftCredits((prev) => prev - MESSAGE_HIGHLIGHT_CREDIT_COST);
      setHighlightNext(false);
    } else {
      const data = await messageRes.json().catch(() => null);
      setUploadError(data?.error ?? t("imageUploadFailed"));
    }
  }

  return (
    <>
    <div
      className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6"
      style={chatTheme ? { backgroundColor: chatTheme.backgroundColor } : undefined}
    >
      <div className="flex-1 flex flex-col gap-3 mb-4">
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          const isRead =
            isMine &&
            hasReadReceipts &&
            otherLastReadAt !== null &&
            new Date(otherLastReadAt) >= new Date(m.createdAt);

          return (
            <div key={m.id} className={isMine ? "self-end" : "self-start"}>
              {m.giftEmoji ? (
                // TILLAGD 2026-09-21 - presentbubbla: stor emoji, ingen
                // vanlig chattbubbla runt, ett litet studs vid ankomst.
                <div className="text-4xl px-2 animate-gift-pop" role="img" aria-label="Present">
                  {m.giftEmoji}
                </div>
              ) : m.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(m.imageUrl)}
                  className={`block max-w-[75%] rounded-sm ${
                    m.highlighted ? "ring-2 ring-gold shadow-[0_0_12px_rgba(217,182,103,0.5)]" : ""
                  }`}
                  aria-label="Förstora bild"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets */}
                  <img
                    src={m.imageUrl}
                    alt=""
                    className="max-w-full rounded-sm border border-border cursor-zoom-in"
                  />
                </button>
              ) : (
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-sm text-sm ${
                    isMine
                      ? chatTheme
                        ? "text-ivory"
                        : "bg-wine text-ivory"
                      : "bg-surface text-ivory border border-border"
                  } ${
                    // TILLAGD 2026-09-27 (andra passet) - visuell markering
                    // för ett "lyft" meddelande (se Message.highlighted).
                    m.highlighted ? "ring-2 ring-gold shadow-[0_0_12px_rgba(217,182,103,0.5)]" : ""
                  }`}
                  style={isMine && chatTheme ? { backgroundColor: chatTheme.bubbleColor } : undefined}
                >
                  {m.content}
                </div>
              )}
              {isMine && hasReadReceipts && (
                <p className="text-[10px] text-ivory-muted mt-0.5 text-right">
                  {isRead ? t("read") : t("sent")}
                </p>
              )}
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-ivory-muted text-center py-8">{t("sayHi")}</p>
        )}
      </div>

      {uploadError && <p className="text-xs text-ivory-muted mb-2">{uploadError}</p>}
      {giftError && <p className="text-xs text-ivory-muted mb-2">{giftError}</p>}

      {isActive ? (
        <form onSubmit={send} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="px-3 rounded-sm border border-border text-ivory-muted hover:border-gold disabled:opacity-50 transition-colors"
            aria-label={t("attachImage")}
          >
            📷
          </button>

          {/* TILLAGD 2026-09-21 - gåvo-väljare (se claude/velvetine-status.md). */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setGiftPickerOpen((open) => !open)}
              disabled={sending}
              className="px-3 rounded-sm border border-border text-ivory-muted hover:border-gold disabled:opacity-50 transition-colors"
              aria-label={t("sendGift")}
            >
              🎁
            </button>
            {giftPickerOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-64 bg-surface border border-border rounded-sm shadow-lg p-2 z-20">
                <div className="flex items-center justify-between px-1 pb-1.5">
                  <p className="text-xs text-ivory-muted">{t("giftPickerTitle")}</p>
                  <p className="text-xs text-gold">{t("giftCreditsBalance", { count: giftCredits })}</p>
                </div>
                {gifts.length === 0 ? (
                  <p className="text-xs text-ivory-muted px-1 py-1.5">{t("noGiftsAvailable")}</p>
                ) : (
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {gifts.map((gift) => {
                      const affordable = giftCredits >= gift.creditCost;
                      return (
                        <button
                          key={gift.id}
                          type="button"
                          onClick={() => sendGift(gift)}
                          disabled={sending || !affordable}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-left hover:bg-surface-raised disabled:opacity-40 transition-colors"
                        >
                          <span className="text-xl">{gift.emoji}</span>
                          <span className="text-sm text-ivory flex-1">{gift.name}</span>
                          <span className="text-xs text-ivory-muted">{gift.creditCost}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="px-1 pt-1.5 mt-1 border-t border-border">
                  <Link href="/store" className="text-xs text-gold hover:text-gold-bright">
                    {t("buyMoreCredits")} →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* TILLAGD 2026-09-27 (andra passet, se claude/velvetine-status.md)
              - "lyft det här meddelandet"-växel. Gäller aldrig gåvor (se
              sendGift ovan), bara vanlig text/bild via send()/handleFileSelected. */}
          <button
            type="button"
            onClick={() => setHighlightNext((v) => !v)}
            disabled={sending || giftCredits < MESSAGE_HIGHLIGHT_CREDIT_COST}
            className={`px-3 rounded-sm border transition-colors disabled:opacity-40 ${
              highlightNext
                ? "border-gold bg-gold/20 text-gold"
                : "border-border text-ivory-muted hover:border-gold"
            }`}
            aria-label={t("highlightMessage")}
            title={t("highlightMessageHint", { cost: MESSAGE_HIGHLIGHT_CREDIT_COST })}
          >
            ✨
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder")}
            className="flex-1 bg-surface border border-border rounded-sm px-4 py-3 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-5 rounded-sm bg-wine text-ivory hover:bg-wine-bright disabled:opacity-50 transition-colors"
          >
            {t("send")}
          </button>
        </form>
      ) : (
        <p className="text-sm text-ivory-muted text-center">{t("inactive")}</p>
      )}
    </div>

    {mounted &&
      lightboxUrl &&
      createPortal(
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-ink/90 flex flex-col items-center justify-center p-6 cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface text-ivory flex items-center justify-center hover:bg-surface-raised"
          >
            ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[min(90vw,40rem)] h-[min(70vh,40rem)] flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets */}
            <img
              src={lightboxUrl}
              alt=""
              className="max-w-full max-h-full w-full h-full rounded-sm object-contain cursor-default"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
