"use client";

import { useState } from "react";

interface Props {
  imageUrl: string;
}

export function SafetyFlagImageReveal({ imageUrl }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const urlReference = (
    <p className="text-[10px] text-ivory-muted break-all max-w-[200px] mt-2">
      URL (för rapportering): {imageUrl}
    </p>
  );

  if (revealed) {
    return (
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- deliberate, confirmation-gated review of flagged content, not a normal display image */}
        <img
          src={imageUrl}
          alt=""
          className="max-w-[200px] max-h-[200px] rounded-sm border border-gold object-contain"
        />
        <button
          onClick={() => setRevealed(false)}
          className="block mt-2 text-xs text-ivory-muted hover:text-ivory"
        >
          Dölj igen
        </button>
        {urlReference}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="text-xs">
        <p className="text-ivory-muted mb-2">
          Detta är känsligt material. Visa bara om du behöver bedöma flaggningen. Hantera
          varsamt - stäng när du är klar.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setRevealed(true)}
            className="px-3 py-1.5 rounded-sm border border-gold text-ivory hover:bg-surface-raised"
          >
            Ja, visa
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-ivory-muted hover:text-ivory"
          >
            Avbryt
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-gold hover:text-gold-bright underline"
    >
      Visa bild för granskning
    </button>
  );
}
