"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportActionButtons({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"suspend" | "ban" | "dismiss" | null>(null);

  async function resolve(action: "suspend" | "ban" | "dismiss") {
    setLoading(action);
    await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <button
        disabled={loading !== null}
        onClick={() => resolve("suspend")}
        className="px-4 py-2 rounded-sm text-sm text-ivory-muted hover:text-gold-bright disabled:opacity-50 transition-colors"
      >
        {loading === "suspend" ? "Stänger av..." : "Stäng av (tillfälligt)"}
      </button>
      <button
        disabled={loading !== null}
        onClick={() => resolve("ban")}
        className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 transition-colors"
      >
        {loading === "ban" ? "Bannar..." : "Banna permanent"}
      </button>
      <button
        disabled={loading !== null}
        onClick={() => resolve("dismiss")}
        className="px-4 py-2 rounded-sm text-sm text-ivory-muted hover:text-ivory disabled:opacity-50 transition-colors"
      >
        {loading === "dismiss" ? "Avfärdar..." : "Avfärda"}
      </button>
    </div>
  );
}
