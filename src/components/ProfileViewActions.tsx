"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export function ProfileViewActions({
  targetUserId,
  matchId,
  canMessageFirst,
}: {
  targetUserId: string;
  matchId: string | null;
  canMessageFirst: boolean;
}) {
  const t = useTranslations("Discover");
  const router = useRouter();
  const [swiped, setSwiped] = useState(false);
  const [composingMessage, setComposingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  async function swipe(direction: "LIKE" | "PASS") {
    setLoading(true);
    const res = await fetch("/api/discover/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, direction }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      if (data.matched && data.matchId) {
        router.push(`/matches/${data.matchId}`);
        return;
      }
      setSwiped(true);
    }
  }

  async function sendFirstMessage() {
    if (!messageText.trim() || loading) return;
    setLoading(true);
    const res = await fetch("/api/discover/message-first", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, content: messageText }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.matchId) {
      router.push(`/matches/${data.matchId}`);
    }
  }

  if (matchId) {
    return (
      <div className="mt-4">
        <Link
          href={`/matches/${matchId}`}
          className="block text-center px-4 py-3 rounded-sm bg-wine text-ivory hover:bg-wine-bright transition-colors"
        >
          💬 {t("openChat")}
        </Link>
      </div>
    );
  }

  if (swiped) {
    return <p className="mt-4 text-sm text-ivory-muted text-center">{t("swipedNotice")}</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex gap-3">
        <button
          onClick={() => swipe("PASS")}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-sm border border-border text-ivory-muted hover:border-gold disabled:opacity-50 transition-colors"
        >
          {t("pass")}
        </button>
        <button
          onClick={() => swipe("LIKE")}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-sm bg-wine text-ivory hover:bg-wine-bright disabled:opacity-50 transition-colors"
        >
          {t("like")}
        </button>
      </div>

      {canMessageFirst && (
        <div>
          {composingMessage ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={t("messageFirstPlaceholder")}
                rows={2}
                maxLength={2000}
                className="bg-surface border border-border rounded-sm px-3 py-2 text-sm text-ivory placeholder:text-ivory-muted/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={sendFirstMessage}
                  disabled={loading || !messageText.trim()}
                  className="px-4 py-2 rounded-sm text-sm bg-wine text-ivory hover:bg-wine-bright disabled:opacity-50"
                >
                  {t("messageFirstSend")}
                </button>
                <button
                  onClick={() => setComposingMessage(false)}
                  className="px-4 py-2 rounded-sm text-sm text-ivory-muted hover:text-ivory"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setComposingMessage(true)}
              className="text-sm text-gold hover:text-gold-bright"
            >
              💬 {t("messageFirstButton")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
