export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string;
  creditsRemaining: number;
  createdAt?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
  totalLeads: number;
  completedLeads: number;
  failedLeads: number;
  pendingLeads: number;
  processingLeads: number;
}

export interface CampaignDetail {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  leads: Lead[];
}

export interface Lead {
  id: string;
  domain: string;
  status: string;
  foundEmail: string | null;
  viralRoast: string | null;
  outreachSubject: string | null;
  outreachBody: string | null;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  tier: string;
  status: string;
  creditsPerPeriod: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  tier: string;
  creditsAdded: number;
  status: string;
  createdAt: string;
}

export const TIER_LABELS: Record<string, string> = {
  free: "Free",
  growth: "Growth",
  scale: "Scale",
};

export const TIER_DETAILS: Record<string, { name: string; price: string; credits: string; features: string[] }> = {
  free: { name: "Free", price: "$0", credits: "50 credits", features: ["AI Roasts", "Cold Emails", "3 campaigns", "Basic pipeline"] },
  growth: { name: "Growth", price: "$49/mo", credits: "1,000 credits/mo", features: ["Everything in Free", "25 campaigns", "Email delivery", "Priority processing", "RAG pipeline"] },
  scale: { name: "Scale", price: "$99/mo", credits: "3,000 credits/mo", features: ["Everything in Growth", "Unlimited campaigns", "API access", "Bulk upload", "Priority support"] },
};
