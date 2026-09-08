"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

const POLL_INTERVAL_MS = 3000;

interface Message {
  id: string;
  content: string | null;
  imageUrl: string | null;
  senderId: string;
  createdAt: string;
}

export function ChatThread({
  matchId,
  currentUserId,
  initialMessages,
  isActive: initialIsActive,
  hasReadReceipts = false,
  otherLastReadAt: initialOtherLastReadAt = null,
}: {
  matchId: string;
  currentUserId: string;
  initialMessages: Message[];
  isActive: boolean;
  hasReadReceipts?: boolean;
  otherLastReadAt?: string | null;
}) {
  const t = useTranslations("Chat");
  const [messages, setMessages] = useState(initialMessages);
  const [otherLastReadAt, setOtherLastReadAt] = useState(initialOtherLastReadAt);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
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

    setSending(true);
    const res = await fetch(`/api/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setSending(false);

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText("");
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
      body: JSON.stringify({ imageUrl: uploadData.url }),
    });
    setSending(false);

    if (messageRes.ok) {
      const data = await messageRes.json();
      setMessages((prev) => [...prev, data.message]);
    }
  }

  return (
    <>
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
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
              {m.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(m.imageUrl)}
                  className="block max-w-[75%]"
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
                    isMine ? "bg-wine text-ivory" : "bg-surface text-ivory border border-border"
                  }`}
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
