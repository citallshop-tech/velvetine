"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { getAnalyticsConsent } from "@/lib/analyticsConsent";
import { ensureVisitorId } from "@/lib/visitorCookie";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (!getAnalyticsConsent()) return;

    const visitorId = ensureVisitorId();

    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId }),
      keepalive: true,
    }).catch(() => {
      // Tracking failures should never break the page for a real visitor.
    });
  }, [pathname]);

  return null;
}
