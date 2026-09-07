"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerificationActionButtons({ selfieId }: { selfieId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(approve: boolean) {
    setLoading(approve ? "approve" : "reject");
    await fetch("/api/admin/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfieId, approve }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <button
        disabled={loading !== null}
        onClick={() => act(true)}
        className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 transition-colors"
      >
        {loading === "approve" ? "Godkänner..." : "Godkänn"}
      </button>
      <button
        disabled={loading !== null}
        onClick={() => act(false)}
        className="px-4 py-2 rounded-sm text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50 transition-colors"
      >
        {loading === "reject" ? "Nekar..." : "Neka"}
      </button>
    </div>
  );
}
