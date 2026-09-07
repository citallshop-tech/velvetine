"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type Support = "checking" | "unsupported" | "granted" | "denied" | "default";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationToggle() {
  const t = useTranslations("Dashboard");
  const [status, setStatus] = useState<Support>("checking");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      setStatus(Notification.permission as Support);

      if (Notification.permission === "granted") {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        const existing = await registration?.pushManager.getSubscription();
        setSubscribed(Boolean(existing));
      }
    }
    check();
  }, []);

  async function enable() {
    setBusy(true);

    const permission = await Notification.requestPermission();
    setStatus(permission as Support);
    if (permission !== "granted") {
      setBusy(false);
      return;
    }

    const keyRes = await fetch("/api/push/vapid-key");
    if (!keyRes.ok) {
      setBusy(false);
      return;
    }
    const { publicKey } = await keyRes.json();

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    setSubscribed(true);
    setBusy(false);
  }

  async function disable() {
    setBusy(true);
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    const subscription = await registration?.pushManager.getSubscription();

    if (subscription) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }

    setSubscribed(false);
    setBusy(false);
  }

  return (
    <section className="border border-border rounded-sm p-6 bg-surface mb-10">
      <h2 className="text-ivory mb-2">{t("notificationsTitle")}</h2>
      <p className="text-sm text-ivory-muted mb-3">{t("notificationsBody")}</p>

      {status === "unsupported" && (
        <p className="text-xs text-ivory-muted">{t("notificationsUnsupported")}</p>
      )}
      {status === "denied" && (
        <p className="text-xs text-ivory-muted">{t("notificationsDenied")}</p>
      )}
      {(status === "default" || status === "granted") && (
        <button
          onClick={subscribed ? disable : enable}
          disabled={busy}
          className={`px-4 py-2 rounded-sm text-sm border transition-colors disabled:opacity-50 ${
            subscribed
              ? "border-gold bg-surface-raised text-gold"
              : "border-border text-ivory-muted hover:border-gold"
          }`}
        >
          {subscribed ? t("notificationsOn") : t("notificationsEnable")}
        </button>
      )}
    </section>
  );
}
