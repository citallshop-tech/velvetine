"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const REASON_KEYS = [
  { value: "FAKE_PROFILE", key: "reasonFakeProfile" },
  { value: "HARASSMENT", key: "reasonHarassment" },
  { value: "INAPPROPRIATE_CONTENT", key: "reasonInappropriate" },
  { value: "UNDERAGE_SUSPECTED", key: "reasonUnderage" },
  { value: "SCAM", key: "reasonScam" },
  { value: "OTHER", key: "reasonOther" },
] as const;

export function ReportBlockMenu({
  targetUserId,
  onBlocked,
}: {
  targetUserId: string;
  onBlocked?: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("ReportBlock");
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(REASON_KEYS[0].value);
  const [details, setDetails] = useState("");
  const [done, setDone] = useState<string | null>(null);

  async function block() {
    await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
    setDone(t("blockedNotice"));
    setOpen(false);
    onBlocked?.();
    router.refresh();
  }

  async function submitReport(event: FormEvent) {
    event.preventDefault();
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, reason, details }),
    });
    setDone(t("reportSentNotice"));
    setReporting(false);
    setOpen(false);
  }

  if (done) {
    return <p className="text-xs text-ivory-muted">{done}</p>;
  }

  if (reporting) {
    return (
      <form
        onSubmit={submitReport}
        className="flex flex-col gap-2 border border-border rounded-sm p-3 bg-surface w-full max-w-xs"
      >
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="bg-ink border border-border rounded-sm px-2 py-1 text-sm text-ivory"
        >
          {REASON_KEYS.map((r) => (
            <option key={r.value} value={r.value}>
              {t(r.key)}
            </option>
          ))}
        </select>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={t("detailsPlaceholder")}
          rows={2}
          className="bg-ink border border-border rounded-sm px-2 py-1 text-sm text-ivory placeholder:text-ivory-muted/50"
        />
        <div className="flex gap-3">
          <button type="submit" className="text-sm text-gold hover:text-gold-bright">
            {t("sendReport")}
          </button>
          <button type="button" onClick={() => setReporting(false)} className="text-sm text-ivory-muted">
            {t("cancel")}
          </button>
        </div>
      </form>
    );
  }

  if (open) {
    return (
      <div className="flex gap-4">
        <button onClick={block} className="text-xs text-ivory-muted hover:text-gold-bright">
          {t("block")}
        </button>
        <button onClick={() => setReporting(true)} className="text-xs text-ivory-muted hover:text-gold-bright">
          {t("report")}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-ivory-muted">
          {t("close")}
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setOpen(true)} className="text-xs text-ivory-muted hover:text-ivory" aria-label={t("moreOptions")}>
      •••
    </button>
  );
}
