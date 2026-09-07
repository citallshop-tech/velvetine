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
