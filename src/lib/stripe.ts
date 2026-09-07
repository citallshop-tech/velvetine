import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Not throwing at import time if the key is missing - the same
// graceful-degradation pattern as email/OpenAI/push. Routes that
// actually need Stripe check isStripeConfigured() and return a clear
// error instead of crashing the whole app when the key isn't set yet.
export const stripe = secretKey
  ? new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" })
  : null;

export function isStripeConfigured(): boolean {
  return stripe !== null;
}
