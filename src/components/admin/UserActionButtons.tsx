"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ConfirmTarget = "ban" | "delete" | null;

const SUSPEND_DURATIONS = [
  { label: "1 dag", days: 1 },
  { label: "3 dagar", days: 3 },
  { label: "7 dagar", days: 7 },
  { label: "30 dagar", days: 30 },
];

export function UserActionButtons({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<ConfirmTarget>(null);
  const [choosingDuration, setChoosingDuration] = useState(false);

  async function suspend(days: number) {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    setLoading(false);
    setChoosingDuration(false);
    router.refresh();
  }

  async function act(action: "reactivate" | "ban" | "delete") {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/${action}`, { method: "POST" });
    setLoading(false);
    setConfirming(null);
    router.refresh();
  }

  if (choosingDuration) {
    return (
      <div className="flex flex-col gap-2 items-end">
        <span className="text-xs text-ivory-muted">Stäng av hur länge? Återaktiveras automatiskt.</span>
        <div className="flex gap-3 flex-wrap justify-end">
          {SUSPEND_DURATIONS.map((d) => (
            <button
              key={d.days}
              disabled={loading}
              onClick={() => suspend(d.days)}
              className="text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50"
            >
              {d.label}
            </button>
          ))}
          <button
            disabled={loading}
            onClick={() => setChoosingDuration(false)}
            className="text-sm text-ivory-muted hover:text-ivory"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  if (confirming) {
    const isDelete = confirming === "delete";
    return (
      <div className="flex flex-col gap-2 items-end">
        <span className="text-xs text-ivory-muted">
          {isDelete
            ? "Raderar personuppgifter permanent. Går inte att ångra."
            : "Permanent avstängning. Data behålls (t.ex. för polisärenden). Går inte att ångra."}
        </span>
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => act(confirming)}
            className="text-sm text-gold-bright hover:text-gold disabled:opacity-50"
          >
            {loading ? "Genomför..." : isDelete ? "Ja, radera" : "Ja, banna"}
          </button>
          <button
            disabled={loading}
            onClick={() => setConfirming(null)}
            className="text-sm text-ivory-muted hover:text-ivory"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-end">
      {status === "SUSPENDED" ? (
        <button
          disabled={loading}
          onClick={() => act("reactivate")}
          className="text-sm text-gold hover:text-gold-bright disabled:opacity-50"
        >
          Återaktivera nu
        </button>
      ) : status === "ACTIVE" ? (
        <button
          disabled={loading}
          onClick={() => setChoosingDuration(true)}
          className="text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50"
        >
          Stäng av
        </button>
      ) : null}

      {status !== "BANNED" && (
        <button
          disabled={loading}
          onClick={() => setConfirming("ban")}
          className="text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50"
        >
          Banna
        </button>
      )}

      <button
        disabled={loading}
        onClick={() => setConfirming("delete")}
        className="text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50"
      >
        Radera permanent
      </button>
    </div>
  );
}
