"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ReportBlockMenu } from "@/components/ReportBlockMenu";
import { ProfileCard } from "@/components/ProfileCard";

interface Candidate {
  id: string;
  displayName: string;
  birthDate: string;
  bio: string | null;
  heightCm: number | null;
  occupation: string | null;
  bodyType: string | null;
  hairColor: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  relationshipIntent: string | null;
  tier: { name: string } | null;
  tierLevel: number | null;
  verified: boolean;
  equippedFrame: { frameColor: string; frameStyle: string } | null;
  promptAnswers: { id: string; answer: string; prompt: { question: string } }[];
  showcaseItems: { id: string; label: string; description: string | null; photoUrl: string | null }[];
  photoUrls: string[];
  blurred: boolean;
}

// Förstklassig ("Premier") and up - matches src/app/api/discover/message-first/route.ts.
const MIN_TIER_LEVEL_FOR_MESSAGE_FIRST = 4;

function calcAge(birthDateStr: string): number {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function DiscoverDeck({
  initialCandidates,
  viewerTierLevel = 0,
}: {
  initialCandidates: Candidate[];
  viewerTierLevel?: number;
}) {
  const t = useTranslations("Discover");
  const [candidates] = useState(initialCandidates);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [matchNotice, setMatchNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [composingMessage, setComposingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");

  const canMessageFirst = viewerTierLevel >= MIN_TIER_LEVEL_FOR_MESSAGE_FIRST;

  const current = candidates[index];

  async function sendFirstMessage() {
    if (!current || !messageText.trim() || loading) return;
    setLoading(true);

    await fetch("/api/discover/message-first", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: current.id, content: messageText }),
    });

    setLoading(false);
    setComposingMessage(false);
    setMessageText("");
    setMatchNotice(t("matchNotice"));
    setHistory((h) => [...h, current.id]);
    setIndex((i) => i + 1);
  }

  async function swipe(direction: "LIKE" | "PASS") {
    if (!current || loading) return;
    setLoading(true);

    const res = await fetch("/api/discover/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: current.id, direction }),
    });
    const data = await res.json();

    setLoading(false);
    if (data.matched) {
      setMatchNotice(t("matchNotice"));
    }
    setHistory((h) => [...h, current.id]);
    setIndex((i) => i + 1);
  }

  async function goBack() {
    if (history.length === 0 || loading) return;
    const lastId = history[history.length - 1];
    setLoading(true);

    await fetch("/api/discover/undo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: lastId }),
    });

    setLoading(false);
    setMatchNotice(null);
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
  }

  if (!current) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-ivory-muted mb-4">{t("noMoreProfiles")}</p>
        {history.length > 0 && (
          <button
            disabled={loading}
            onClick={goBack}
            className="text-sm text-gold hover:text-gold-bright disabled:opacity-50"
          >
            ← {t("backToPrevious")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {matchNotice && (
        <div className="border border-gold rounded-sm bg-surface-raised p-4 mb-6 text-center">
          <p className="text-gold mb-2">{matchNotice}</p>
          <button onClick={() => setMatchNotice(null)} className="text-sm text-ivory-muted hover:text-ivory">
            {t("keepBrowsing")}
          </button>
        </div>
      )}

      <ProfileCard
        data={{
          displayName: current.displayName,
          age: calcAge(current.birthDate),
          tierName: current.tier?.name ?? null,
          tierLevel: current.tierLevel,
          verified: current.verified,
          equippedFrame: current.equippedFrame,
          bio: current.bio,
          heightCm: current.heightCm,
          occupation: current.occupation,
          bodyType: current.bodyType,
          hairColor: current.hairColor,
          locationCity: current.locationCity,
          locationCountry: current.locationCountry,
          relationshipIntent: current.relationshipIntent,
          promptAnswers: current.promptAnswers.map((pa) => ({
            id: pa.id,
            question: pa.prompt.question,
            answer: pa.answer,
          })),
          showcaseItems: current.showcaseItems,
          photoUrls: current.photoUrls,
          blurred: current.blurred,
        }}
      />

      {canMessageFirst && !current.blurred && (
        <div className="mt-4 px-1">
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
              {t("messageFirstButton")}
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 px-1">
        <ReportBlockMenu targetUserId={current.id} onBlocked={() => setIndex((i) => i + 1)} />
        <div className="flex gap-3">
          {history.length > 0 && (
            <button
              disabled={loading}
              onClick={goBack}
              className="px-4 py-2 rounded-sm text-ivory-muted hover:text-gold disabled:opacity-50 transition-colors"
              aria-label={t("backAria")}
            >
              ← {t("back")}
            </button>
          )}
          <button
            disabled={loading}
            onClick={() => swipe("PASS")}
            className="px-5 py-2 rounded-sm border border-border text-ivory-muted hover:border-gold disabled:opacity-50 transition-colors"
          >
            {t("pass")}
          </button>
          <button
            disabled={loading}
            onClick={() => swipe("LIKE")}
            className="px-5 py-2 rounded-sm bg-wine text-ivory hover:bg-wine-bright disabled:opacity-50 transition-colors"
          >
            {t("like")}
          </button>
        </div>
      </div>
    </div>
  );
}
