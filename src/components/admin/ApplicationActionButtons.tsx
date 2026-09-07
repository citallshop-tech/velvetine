"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplicationActionButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch(`/api/admin/applications/${applicationId}/${action}`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <button
        disabled={loading !== null}
        onClick={() => act("approve")}
        className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 transition-colors"
      >
        {loading === "approve" ? "Godkänner..." : "Godkänn"}
      </button>
      <button
        disabled={loading !== null}
        onClick={() => act("reject")}
        className="px-4 py-2 rounded-sm text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50 transition-colors"
      >
        {loading === "reject" ? "Nekar..." : "Neka"}
      </button>
    </div>
  );
}
