"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Person {
  userId: string;
  displayName: string;
  tier: string | null;
  photoUrl: string | null;
  verified: boolean;
}

export function LikesList({ people: initialPeople }: { people: Person[] }) {
  const t = useTranslations("Likes");
  const [people, setPeople] = useState(initialPeople);
  const [matchNotice, setMatchNotice] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function respond(userId: string, direction: "LIKE" | "PASS") {
    setLoadingId(userId);
    const res = await fetch("/api/discover/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId, direction }),
    });
    const data = await res.json();
    setLoadingId(null);
    setPeople((prev) => prev.filter((p) => p.userId !== userId));
    if (data.matched) {
      setMatchNotice(t("matchNotice"));
    }
  }

  return (
    <div>
      {matchNotice && (
        <div className="border border-gold rounded-sm bg-surface-raised p-4 mb-6 text-center">
          <p className="text-gold">{matchNotice}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {people.map((person) => (
          <div
            key={person.userId}
            className="border border-border rounded-sm bg-surface p-4 flex items-center gap-4"
          >
            <Link
              href={`/u/${person.userId}`}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center shrink-0 overflow-hidden">
                {person.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
                  <img src={person.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display italic text-gold">
                    {person.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ivory">
                  {person.displayName}
                  {person.verified && <span className="text-gold ml-1">✓</span>}
                </p>
                {person.tier && <p className="text-xs text-gold">{person.tier}</p>}
              </div>
            </Link>
            <div className="flex gap-3 shrink-0">
              <button
                disabled={loadingId === person.userId}
                onClick={() => respond(person.userId, "PASS")}
                className="text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50"
              >
                {t("pass")}
              </button>
              <button
                disabled={loadingId === person.userId}
                onClick={() => respond(person.userId, "LIKE")}
                className="px-3 py-1.5 rounded-sm bg-wine text-ivory hover:bg-wine-bright text-sm disabled:opacity-50"
              >
                {t("likeBack")}
              </button>
            </div>
          </div>
        ))}

        {people.length === 0 && (
          <p className="text-ivory-muted text-center py-12">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
