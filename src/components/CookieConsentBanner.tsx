"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/analyticsConsent";
import { ensureVisitorId, clearVisitorId } from "@/lib/visitorCookie";
import { setClientCookie, readClientCookie } from "@/lib/clientCookie";

const CONSENT_COOKIE = "velvetine_cookie_consent";
const REOPEN_EVENT = "velvetine:reopen-cookie-consent";

function hasConsentCookie(): boolean {
  return readClientCookie(CONSENT_COOKIE) !== null;
}

function setConsentCookie() {
  const oneYear = 60 * 60 * 24 * 365;
  setClientCookie(CONSENT_COOKIE, "1", oneYear);
}

/** Called from the footer's "Cookie settings" link to review the panel again. */
export function reopenCookieConsent() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

function ToggleRow({
  title,
  body,
  checked,
  locked,
  onChange,
  lockedLabel,
}: {
  title: string;
  body: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
  lockedLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between border border-border rounded-sm p-4 mb-4">
      <div className="pr-4">
        <p className="text-ivory text-sm mb-1">{title}</p>
        <p className="text-xs text-ivory-muted">{body}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={locked}
        aria-label={locked ? lockedLabel : title}
        onClick={() => onChange?.(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-border"
        } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-all ${
            checked ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function PreferencesPanel({
  analyticsEnabled,
  onAnalyticsChange,
  onClose,
  onSave,
}: {
  analyticsEnabled: boolean;
  onAnalyticsChange: (next: boolean) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("CookieConsent");

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/80 flex items-end sm:items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-sm p-6 w-full max-w-md"
      >
        <h2 className="font-display text-xl text-ivory mb-4">{t("panelTitle")}</h2>

        <ToggleRow
          title={t("necessaryTitle")}
          body={t("necessaryBody")}
          checked
          locked
          lockedLabel={t("alwaysOn")}
        />

        <ToggleRow
          title={t("analyticsTitle")}
          body={t("analyticsBody")}
          checked={analyticsEnabled}
          onChange={onAnalyticsChange}
        />

        <button
          onClick={onSave}
          className="w-full px-5 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised mb-3"
        >
          {t("save")}
        </button>

        <Link
          href="/cookies"
          onClick={onClose}
          className="block text-center text-xs text-ivory-muted hover:text-gold"
        >
          {t("fullPolicy")}
        </Link>
      </div>
    </div>,
    document.body
  );
}

export function CookieConsentBanner() {
  const t = useTranslations("CookieConsent");
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (!hasConsentCookie()) {
      setVisible(true);
    }
    setAnalyticsEnabled(getAnalyticsConsent());

    const reopen = () => setPanelOpen(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  function acceptNecessaryOnly() {
    setConsentCookie();
    setAnalyticsConsent(false);
    clearVisitorId();
    setVisible(false);
  }

  function saveFromPanel() {
    setConsentCookie();
    setAnalyticsConsent(analyticsEnabled);
    if (analyticsEnabled) {
      ensureVisitorId();
    } else {
      clearVisitorId();
    }
    setVisible(false);
    setPanelOpen(false);
  }

  return (
    <>
      {visible && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center gap-4">
          <p className="text-sm text-ivory-muted flex-1">{t("message")}</p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => setPanelOpen(true)}
              className="px-5 py-2 rounded-sm text-sm text-ivory-muted hover:text-ivory border border-border"
            >
              {t("manage")}
            </button>
            <button
              onClick={acceptNecessaryOnly}
              className="px-5 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised"
            >
              {t("accept")}
            </button>
          </div>
        </div>
      )}

      {panelOpen && (
        <PreferencesPanel
          analyticsEnabled={analyticsEnabled}
          onAnalyticsChange={setAnalyticsEnabled}
          onClose={() => setPanelOpen(false)}
          onSave={saveFromPanel}
        />
      )}
    </>
  );
}
