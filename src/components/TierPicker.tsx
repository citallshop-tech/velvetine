"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface TierOption {
  id: string;
  name: string;
  level: number;
  priceSek: number;
  requiresApplication: boolean;
  applicationStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  isCurrent: boolean;
  purchasable: boolean;
}

function ApplicationForm({
  tierId,
  onSubmitted,
}: {
  tierId: string;
  onSubmitted: (status: "APPROVED" | "REJECTED") => void;
}) {
  const t = useTranslations("Upgrade");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const res = await fetch("/api/tier-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId, note }),
    });
    const data = await res.json();
    setSubmitting(false);
    onSubmitted(data.application?.status ?? "REJECTED");
  }

  return (
    <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
      <label className="text-xs text-ivory-muted">{t("applyNoteLabel")}</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("applyNotePlaceholder")}
        rows={2}
        maxLength={1000}
        className="bg-ink border border-border rounded-sm px-3 py-2 text-sm text-ivory placeholder:text-ivory-muted/50"
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="self-start px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
      >
        {submitting ? t("applySubmitting") : t("applySubmit")}
      </button>
    </div>
  );
}

export function TierPicker({
  tiers: initialTiers,
  hasSubscription,
}: {
  tiers: TierOption[];
  hasSubscription: boolean;
}) {
  const t = useTranslations("Upgrade");
  const router = useRouter();
  const [tiers, setTiers] = useState(initialTiers);
  const [openApplyId, setOpenApplyId] = useState<string | null>(null);
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);

  async function checkout(tierId: string) {
    setLoadingTierId(tierId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId }),
    });
    const data = await res.json();

    if (res.ok && data.switched) {
      // Plan change on an existing subscription - no checkout page to
      // redirect to, just refresh so the new tier shows immediately.
      router.refresh();
      setLoadingTierId(null);
      return;
    }

    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setLoadingTierId(null);
  }

  async function manageSubscription() {
    setManaging(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setManaging(false);
  }

  function handleApplicationSubmitted(tierId: string, status: "APPROVED" | "REJECTED") {
    setTiers((prev) =>
      prev.map((tier) => (tier.id === tierId ? { ...tier, applicationStatus: status } : tier))
    );
    setOpenApplyId(null);

    // Approval is instant now, so there's no reason to make someone
    // click a second "Choose" button right after - go straight to
    // checkout instead of leaving them to notice the button changed.
    if (status === "APPROVED") {
      checkout(tierId);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {tiers.map((tier) => {
        const locked = tier.requiresApplication && tier.applicationStatus !== "APPROVED";

        return (
          <div
            key={tier.id}
            className={`border rounded-sm p-4 ${
              tier.isCurrent ? "border-gold bg-surface-raised" : "border-border bg-surface"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-ivory">{tier.name}</p>
                <p className="text-sm text-gold">{tier.priceSek} kr/mån</p>
                {tier.isCurrent && (
                  <p className="text-xs text-ivory-muted mt-1">{t("currentTier")}</p>
                )}
                {locked && tier.applicationStatus === "PENDING" && (
                  <p className="text-xs text-gold mt-1">{t("applyPending")}</p>
                )}
                {locked && tier.applicationStatus === "REJECTED" && (
                  <p className="text-xs text-ivory-muted mt-1">{t("applyRejected")}</p>
                )}
                {locked && !tier.applicationStatus && (
                  <p className="text-xs text-ivory-muted mt-1">{t("requiresApplicationNote")}</p>
                )}
              </div>

              {!tier.isCurrent && (
                <>
                  {locked ? (
                    tier.applicationStatus === "PENDING" ? null : (
                      <button
                        onClick={() => setOpenApplyId(openApplyId === tier.id ? null : tier.id)}
                        className="px-4 py-2 rounded-sm text-sm border border-border text-ivory-muted hover:border-gold shrink-0"
                      >
                        {tier.applicationStatus === "REJECTED" ? t("applyAgain") : t("applyFirst")}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => checkout(tier.id)}
                      disabled={!tier.purchasable || loadingTierId === tier.id}
                      className="px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50 shrink-0"
                    >
                      {loadingTierId === tier.id ? t("startingCheckout") : t("choose")}
                    </button>
                  )}
                </>
              )}
            </div>

            {openApplyId === tier.id && (
              <ApplicationForm
                tierId={tier.id}
                onSubmitted={(status) => handleApplicationSubmitted(tier.id, status)}
              />
            )}
          </div>
        );
      })}

      {hasSubscription && (
        <button
          onClick={manageSubscription}
          disabled={managing}
          className="mt-4 text-sm text-gold hover:text-gold-bright disabled:opacity-50 self-start"
        >
          {t("manageSubscription")}
        </button>
      )}
    </div>
  );
}
