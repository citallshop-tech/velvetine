"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SafetyFlagActionButton({ flagId }: { flagId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markReviewed() {
    setLoading(true);
    await fetch("/api/admin/safety-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={markReviewed}
      disabled={loading}
      className="px-3 py-1.5 rounded-sm text-xs border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
    >
      {loading ? "Sparar..." : "Klarmarkera (rapporterad/avfärdad)"}
    </button>
  );
}
