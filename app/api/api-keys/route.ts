import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken } from "@/lib/auth";
import { randomBytes, createHash } from "crypto";
import { PBHttp } from "@/lib/pb-http";

function generateApiKey(): { plaintext: string; hash: string } {
  const raw = randomBytes(30).toString("hex");
  const plaintext = `snp_live_${raw}`;
  const hash = createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, hash };
}

export async function GET() {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);

    const keys = await pb.collection("api_keys").getList(1, 100, {
      filter: "user = '" + user.id + "'",
    });
    keys.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

    // Never return keyHash
    const safeKeys = keys.items.map((k) => ({
      id: k.id,
      name: k.name,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.created,
    }));

    return NextResponse.json({ keys: safeKeys });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const { name, expiresAt } = await request.json();

    const { plaintext, hash } = generateApiKey();

    const key = await pb.collection("api_keys").create({
      user: user.id,
      keyHash: hash,
      name: name || "",
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : "",
    });

    return NextResponse.json({
      key: {
        id: key.id,
        name: key.name,
        isActive: key.isActive,
        expiresAt: key.expiresAt,
        createdAt: key.created,
        plaintext,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const { keyId } = await request.json();

    if (!keyId) {
      return NextResponse.json({ error: "keyId required" }, { status: 400 });
    }

    const key = await pb.collection("api_keys").getOne(keyId);

    if (!key || key.user !== user.id) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    await pb.collection("api_keys").delete(keyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
