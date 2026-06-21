import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.USER_SETTINGS_KEY || process.env.OpenRouter_API_KEY?.slice(0, 32).padEnd(32, "0") || "sitesniper-default-key-32chars!";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function maskKey(key: string): string {
  if (key.length <= 12) return "***";
  return key.slice(0, 8) + "..." + key.slice(-4);
}

export async function GET() {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);

    const result = await pb.collection("user_settings").getList(1, 100, {
      filter: "user = '" + user.id + "'",
    });

    const settings = result.items.map((s: any) => ({
      id: s.id,
      service: s.service,
      keyPreview: s.keyPreview || "",
      createdAt: s.created,
    }));

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ settings: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const { service, apiKey } = await request.json();

    if (!service || !apiKey) {
      return NextResponse.json({ error: "service and apiKey required" }, { status: 400 });
    }

    // Check if setting already exists for this service
    const existing = await pb.collection("user_settings").getList(1, 1, {
      filter: "user = '" + user.id + "' && service = '" + service + "'",
    });

    const encrypted = encrypt(apiKey);
    const preview = maskKey(apiKey);

    if (existing.items.length > 0) {
      // Update existing
      await pb.collection("user_settings").update(existing.items[0].id, {
        encryptedKey: encrypted,
        keyPreview: preview,
      });
    } else {
      // Create new
      await pb.collection("user_settings").create({
        user: user.id,
        service,
        encryptedKey: encrypted,
        keyPreview: preview,
      });
    }

    return NextResponse.json({ success: true, keyPreview: preview });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("User settings error:", error);
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const { service } = await request.json();

    if (!service) {
      return NextResponse.json({ error: "service required" }, { status: 400 });
    }

    const existing = await pb.collection("user_settings").getList(1, 1, {
      filter: "user = '" + user.id + "' && service = '" + service + "'",
    });

    if (existing.items.length > 0) {
      await pb.collection("user_settings").delete(existing.items[0].id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 });
  }
}

/**
 * Helper: Get a decrypted API key for a user and service.
 * Used by pipeline and other routes to fetch user-provided keys.
 */
export async function getUserApiKey(userId: string, service: string): Promise<string | null> {
  try {
    const pb = await (await import("@/lib/auth")).getAdminPB();
    const result = await pb.collection("user_settings").getList(1, 1, {
      filter: "user = '" + userId + "' && service = '" + service + "'",
    });

    if (result.items.length === 0) return null;

    return decrypt(result.items[0].encryptedKey);
  } catch {
    return null;
  }
}
