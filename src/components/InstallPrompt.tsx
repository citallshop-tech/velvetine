"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Older iOS Safari doesn't support the display-mode media query.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const t = useTranslations("Install");
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [eligible, setEligible] = useState<"none" | "chromium" | "ios">("none");

  useEffect(() => {
    if (isStandalone()) return;

    if (isIos()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads navigator/matchMedia, browser-only checks that don't exist during SSR
      setEligible("ios");
      return;
    }

    function handler(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
      setEligible("chromium");
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Persistent by design: no dismiss button. It only disappears once the
  // app is actually installed (isStandalone becomes true on next load) or,
  // for Chromium, once the captured prompt event has actually been used.
  if (eligible === "none") return null;

  async function handleInstallClick() {
    if (eligible === "ios") {
      setShowIosInstructions(true);
      return;
    }
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    // A captured prompt event can only be used once regardless of outcome.
    setDeferredEvent(null);
    setEligible("none");
  }

  return (
    <div className="bg-surface border-b border-gold px-6 py-3 flex flex-col sm:flex-row items-center gap-3">
      {showIosInstructions ? (
        <>
          <p className="text-sm text-ivory flex-1 text-center sm:text-left">{t("iosInstructions")}</p>
          <button
            onClick={() => setShowIosInstructions(false)}
            className="text-sm text-gold hover:text-gold-bright shrink-0"
          >
            {t("gotIt")}
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-ivory flex-1 text-center sm:text-left">{t("prompt")}</span>
          <button
            onClick={handleInstallClick}
            className="px-5 py-1.5 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised shrink-0"
          >
            {t("install")}
          </button>
        </>
      )}
    </div>
  );
}
