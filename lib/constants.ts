export const APP_NAME = "SiteSniper AI";
export const APP_DESCRIPTION = "AI-powered B2B growth tool that analyzes websites, finds pain points, and generates personalized cold outreach.";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    credits: 50,
  },
  growth: {
    name: "Growth",
    price: 49,
    credits: 1000,
  },
  scale: {
    name: "Scale",
    price: 99,
    credits: 3000,
  },
} as const;

export const LEAD_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const GENERIC_EMAIL_PREFIXES = [
  "info",
  "noreply",
  "no-reply",
  "support",
  "admin",
  "webmaster",
  "postmaster",
  "abuse",
  "billing",
  "help",
  "contact",
  "hello",
  "hi",
  "team",
  "office",
];

export const MAX_SCRAPED_CHARS = 3500;
export const SCRAPE_TIMEOUT_MS = 8000;
export const BULK_BATCH_SIZE = 3;
export const DASHBOARD_POLL_INTERVAL = 5000;
export const CAMPAIGN_POLL_INTERVAL = 3000;
