import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function ensureConfigured(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    if (!configured) {
      // Only warn once per server run, not once per push attempt.
      console.warn(
        "[push ej konfigurerad] VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY saknas - push-notiser skickas inte."
      );
    }
    return false;
  }

  if (!configured) {
    webpush.setVapidDetails("mailto:support@velvetine.app", publicKey, privateKey);
    configured = true;
  }

  return true;
}

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/**
 * Sends a push to every device this user has subscribed on. Silently
 * does nothing if VAPID keys aren't set up yet (same graceful-skip
 * pattern as email/OpenAI when their keys are missing) - never throws,
 * since a failed push should never break the action that triggered it
 * (sending a message, matching, etc).
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        // 410 Gone / 404 Not Found means the browser unsubscribed on its
        // own (uninstalled, cleared data, etc.) - clean up the dead
        // subscription instead of retrying it forever.
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("Push-notis misslyckades:", err);
        }
      }
    })
  );
}
