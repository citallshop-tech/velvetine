"use client";

import { useState } from "react";

export function NotifyPolicyUpdateButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    "Vi har uppdaterat våra villkor och vår integritetspolicy."
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function send() {
    setSending(true);
    const res = await fetch("/api/admin/notify-policy-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setSending(false);
    setResult(
      res.ok
        ? `Skickat till ${data.sent} av ${data.total} medlemmar.`
        : "Något gick fel."
    );
    setOpen(false);
  }

  if (result) {
    return <p className="text-sm text-ivory-muted">{result}</p>;
  }

  if (open) {
    return (
      <div className="border border-border rounded-sm bg-surface p-4 flex flex-col gap-3 max-w-lg">
        <label className="text-sm text-ivory-muted" htmlFor="policy-message">
          Meddelande som skickas tillsammans med länkar till villkor och integritetspolicy
        </label>
        <textarea
          id="policy-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="bg-ink border border-border rounded-sm px-3 py-2 text-sm text-ivory"
        />
        <div className="flex gap-3">
          <button
            disabled={sending}
            onClick={send}
            className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
          >
            {sending ? "Skickar..." : "Skicka till alla aktiva medlemmar"}
          </button>
          <button
            disabled={sending}
            onClick={() => setOpen(false)}
            className="text-sm text-ivory-muted hover:text-ivory"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="text-sm text-gold hover:text-gold-bright"
    >
      Avisera medlemmar om uppdaterade villkor
    </button>
  );
}
