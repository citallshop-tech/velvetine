"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TierOverride({
  userId,
  currentTierId,
  tiers,
}: {
  userId: string;
  currentTierId: string | null;
  tiers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}/set-tier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId: e.target.value || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={currentTierId ?? ""}
      onChange={handleChange}
      disabled={saving}
      className="bg-ink border border-border rounded-sm px-2 py-1 text-xs text-gold disabled:opacity-50"
    >
      <option value="">— (ingen)</option>
      {tiers.map((tier) => (
        <option key={tier.id} value={tier.id}>
          {tier.name}
        </option>
      ))}
    </select>
  );
}
