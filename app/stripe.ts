import Stripe from "stripe";
import { env } from "cloudflare:workers";

export function getStripe() {
  const key = (env as unknown as { STRIPE_RESTRICTED_KEY?: string }).STRIPE_RESTRICTED_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}
