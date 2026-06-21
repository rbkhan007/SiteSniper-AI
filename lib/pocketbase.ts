import PocketBase from "pocketbase";

const globalForPocketBase = globalThis as unknown as {
  pb: PocketBase | undefined;
};

function createPocketBaseClient() {
  const pb = new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
  );
  return pb;
}

export const pb = globalForPocketBase.pb ?? createPocketBaseClient();

if (process.env.NODE_ENV !== "production") globalForPocketBase.pb = pb;

/**
 * Server-side PocketBase client with auth token
 * Call this in API routes to access authenticated data
 */
export async function getAuthenticatedPB(cookieHeader?: string | null) {
  const p = new PocketBase(
    process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
  );

  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("=") as [string, string])
    );
    const token = cookies["pb_auth"];
    if (token) {
      p.authStore.save(token);
    }
  }

  return p;
}

/**
 * Extract auth token from cookie header
 */
export function extractAuthToken(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("=") as [string, string])
  );
  return cookies["pb_auth"] || null;
}
