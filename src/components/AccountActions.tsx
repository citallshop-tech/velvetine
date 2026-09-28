"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("AccountActions");
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {t("logout")}
    </Button>
  );
}

// TILLAGD 2026-09-28 (Christoffer: "man ska kunna välja mellan att ha kvar
// saker eller inte" - se claude/velvetine-status.md och
// src/app/api/account/pause/route.ts). Samma bekräftelsemönster som
// DeleteAccountButton nedan, men raderar ingenting - kontot döljs bara och
// återaktiveras automatiskt nästa gång personen loggar in.
export function PauseAccountButton() {
  const router = useRouter();
  const t = useTranslations("AccountActions");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        {t("pauseAccount")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-border rounded-sm p-4 bg-surface">
      <p className="text-sm text-ivory-muted">{t("pauseConfirm")}</p>
      <div className="flex gap-3">
        <Button
          variant="primary"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await fetch("/api/account/pause", { method: "POST" });
            router.push("/");
            router.refresh();
          }}
        >
          {loading ? t("pauseConfirmYesLoading") : t("pauseConfirmYes")}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}

export function DeleteAccountButton() {
  const router = useRouter();
  const t = useTranslations("AccountActions");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        {t("deleteAccount")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-border rounded-sm p-4 bg-surface">
      <p className="text-sm text-ivory-muted">{t("deleteConfirm")}</p>
      <div className="flex gap-3">
        <Button
          variant="primary"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await fetch("/api/account/delete", { method: "POST" });
            router.push("/");
            router.refresh();
          }}
        >
          {loading ? t("deleteConfirmYesLoading") : t("deleteConfirmYes")}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}

// TILLAGD 2026-09-28 - visar pausa/radera-valen tillsammans med en kort
// förklarande rad, så det aldrig är otydligt att det är två olika saker
// (se claude/velvetine-status.md). Ersätter den tidigare ensamma
// <DeleteAccountButton /> på /dashboard.
export function AccountClosureSection() {
  const t = useTranslations("AccountActions");
  return (
    <section className="flex flex-col gap-4 items-start">
      <p className="text-sm text-ivory-muted max-w-md">{t("sectionIntro")}</p>
      <div className="flex gap-3 flex-wrap">
        <PauseAccountButton />
        <DeleteAccountButton />
      </div>
    </section>
  );
}
