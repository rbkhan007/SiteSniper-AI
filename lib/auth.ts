import { cookies } from "next/headers";
import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

// ─── Tier Limits ──────────────────────────────────────────────────────
export const TIER_LIMITS: Record<
  string,
  {
    maxCampaigns: number;
    maxLeadsPerCampaign: number;
    creditsPerMonth: number;
    hasApiAccess: boolean;
    hasBulkUpload: boolean;
    hasEmailDelivery: boolean;
    hasPriorityProcessing: boolean;
    hasRagPipeline: boolean;
  }
> = {
  free: {
    maxCampaigns: 3,
    maxLeadsPerCampaign: 50,
    creditsPerMonth: 50,
    hasApiAccess: false,
    hasBulkUpload: false,
    hasEmailDelivery: false,
    hasPriorityProcessing: false,
    hasRagPipeline: false,
  },
  growth: {
    maxCampaigns: 25,
    maxLeadsPerCampaign: 500,
    creditsPerMonth: 1000,
    hasApiAccess: false,
    hasBulkUpload: true,
    hasEmailDelivery: true,
    hasPriorityProcessing: true,
    hasRagPipeline: true,
  },
  scale: {
    maxCampaigns: -1,
    maxLeadsPerCampaign: -1,
    creditsPerMonth: 3000,
    hasApiAccess: true,
    hasBulkUpload: true,
    hasEmailDelivery: true,
    hasPriorityProcessing: true,
    hasRagPipeline: true,
  },
};

export const TIER_LABELS: Record<string, string> = {
  free: "Free",
  growth: "Growth ($49/mo)",
  scale: "Scale ($99/mo)",
};

export const TIER_ORDER = ["free", "growth", "scale"];

export function getTierLimits(tier: string) {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

export function canAccessFeature(tier: string, feature: string): boolean {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const value = limits[feature as keyof typeof limits];
  if (typeof value === "boolean") return value;
  return true;
}

// ─── PocketBase Auth Helpers ──────────────────────────────────────────
function createPBClient() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  return pb;
}

// ─── Admin PB Client (for server-side operations) ────────────────────
let _cachedAdminPB: PocketBase | null = null;

export async function getAdminPB(): Promise<PocketBase> {
  if (_cachedAdminPB) return _cachedAdminPB;

  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPass = process.env.PB_ADMIN_PASS;
  if (!adminEmail || !adminPass) {
    throw new Error("PocketBase admin credentials not configured. Set PB_ADMIN_EMAIL and PB_ADMIN_PASS in .env");
  }

  const pb = createPBClient();
  try {
    await pb.collection("_superusers").authWithPassword(adminEmail, adminPass);
    _cachedAdminPB = pb;
    return pb;
  } catch {
    throw new Error("PocketBase admin auth failed");
  }
}

let _cachedAuthPB: PocketBase | null = null;
let _cachedAuthToken: string | null = null;

/**
 * Get the raw auth token from cookies.
 */
export async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("pb_auth")?.value;
  if (!token) throw new Error("Unauthorized");
  return token;
}

/**
 * Get an authenticated PocketBase client from the current request cookie.
 * Simply saves the token — PB handles expiry validation on API calls.
 */
export async function getAuthPB(): Promise<PocketBase> {
  const token = await getAuthToken();

  if (_cachedAuthPB && _cachedAuthToken === token) {
    return _cachedAuthPB;
  }

  const pb = createPBClient();
  pb.authStore.save(token);

  _cachedAuthPB = pb;
  _cachedAuthToken = token;
  return pb;
}

/**
 * Reset cached PB client (call after mutations that change auth state)
 */
export function resetAuthPB() {
  _cachedAuthPB = null;
  _cachedAuthToken = null;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: string;
  creditsRemaining: number;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get PocketBase auth token from cookies and verify user.
 * Decodes JWT to get user ID, then fetches full user record.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pb_auth")?.value;
    if (!token) return null;

    // Decode JWT to get user ID (without verification — PB handles that)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    if (!payload.id) return null;

    const pb = createPBClient();
    pb.authStore.save(token);

    // Fetch user record using the token
    try {
      const record = await pb.collection("users").getOne(payload.id);
      return {
        id: record.id,
        email: record.email,
        name: record.name || record.email.split("@")[0],
        role: record.role || "user",
        tier: record.tier || "free",
        creditsRemaining: record.creditsRemaining ?? 50,
        stripeCustomerId: record.stripeCustomerId || null,
        createdAt: new Date(record.created),
        updatedAt: new Date(record.updated),
      };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(role: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role && user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireTier(minTier: string): Promise<SessionUser> {
  const user = await requireAuth();
  const tierOrder = ["free", "growth", "scale"];
  const userTierIndex = tierOrder.indexOf(user.tier);
  const requiredTierIndex = tierOrder.indexOf(minTier);

  if (userTierIndex < requiredTierIndex && user.role !== "admin") {
    throw new Error("Insufficient tier");
  }
  return user;
}

export function hasPermission(user: SessionUser, feature: string): boolean {
  if (user.role === "admin") return true;
  return canAccessFeature(user.tier, feature);
}

// ─── Profile Helpers ──────────────────────────────────────────────────
export async function getFullProfile(userId: string): Promise<SessionUser | null> {
  try {
    const pb = createPBClient();
    const cookieStore = await cookies();
    const token = cookieStore.get("pb_auth")?.value;
    if (!token) return null;

    pb.authStore.save(token);

    const record = await pb.collection("users").getOne(userId);
    return {
      id: record.id,
      email: record.email,
      name: record.name || record.email.split("@")[0],
      role: record.role || "user",
      tier: record.tier || "free",
      creditsRemaining: record.creditsRemaining ?? 50,
      stripeCustomerId: record.stripeCustomerId || null,
      createdAt: new Date(record.created),
      updatedAt: new Date(record.updated),
    };
  } catch {
    return null;
  }
}

export async function syncTierFromSubscription(userId: string): Promise<void> {
  try {
    const pb = createPBClient();
    const cookieStore = await cookies();
    const token = cookieStore.get("pb_auth")?.value;
    if (!token) return;

    pb.authStore.save(token);

    const subs = await pb.collection("subscriptions").getList(1, 1, {
      filter: "user = '" + userId + "' && status = 'active'",
    });
    subs.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

    if (subs.items.length > 0) {
      const activeSub = subs.items[0];
      const tierMap: Record<string, string> = {
        growth: "growth",
        scale: "scale",
      };
      const newTier = tierMap[activeSub.tier] || "free";
      await pb.collection("users").update(userId, { tier: newTier });
    } else {
      await pb.collection("users").update(userId, { tier: "free" });
    }
  } catch {
    // Silent fail
  }
}

// ─── API Key Auth ─────────────────────────────────────────────────────
export async function validateApiKey(
  keyHash: string
): Promise<SessionUser | null> {
  try {
    const pb = await getAdminPB();
    const keys = await pb.collection("api_keys").getList(1, 1, {
      filter: `keyHash = '${keyHash}' && isActive = true`,
    });

    if (keys.items.length === 0) return null;

    const apiKey = keys.items[0];

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;

    await pb.collection("api_keys").update(apiKey.id, {
      lastUsedAt: new Date().toISOString(),
    });

    const user = await pb.collection("users").getOne(apiKey.user);
    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
      role: user.role || "user",
      tier: user.tier || "free",
      creditsRemaining: user.creditsRemaining ?? 50,
      stripeCustomerId: user.stripeCustomerId || null,
      createdAt: new Date(user.created),
      updatedAt: new Date(user.updated),
    };
  } catch {
    return null;
  }
}
