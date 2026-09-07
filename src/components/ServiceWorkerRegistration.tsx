"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Deliberately skipped in development: an active service worker
    // caching responses is exactly what caused the confusing "my changes
    // aren't showing up" bugs earlier in this project (a stale worker from
    // a previous project intercepting localhost:3000). Only register
    // against a real production build, where the cache is actually meant
    // to be stable between deploys.
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);

  return null;
}
