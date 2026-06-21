import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const isStripeConfigured = STRIPE_KEY && STRIPE_KEY !== "your_stripe_secret_key" && STRIPE_KEY.startsWith("sk_");

export const stripe = isStripeConfigured
  ? new Stripe(STRIPE_KEY, { apiVersion: "2026-05-27.dahlia" as any })
  : null;

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
  }
  return stripe;
}

export function isStripeReady() {
  return !!stripe;
}

export const PLANS = {
  growth: {
    name: "Growth",
    price: 49,
    credits: 1000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_GROWTH || "",
    features: [
      "25 campaigns",
      "500 leads per campaign",
      "1,000 AI credits/month",
      "Bulk upload domains",
      "AI email generation",
      "RAG-enhanced pipeline",
      "Priority processing",
    ],
  },
  scale: {
    name: "Scale",
    price: 99,
    credits: 3000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SCALE || "",
    features: [
      "Unlimited campaigns",
      "Unlimited leads",
      "3,000 AI credits/month",
      "Bulk upload domains",
      "AI email generation",
      "RAG-enhanced pipeline",
      "Priority processing",
      "Full API access",
    ],
  },
} as const;
