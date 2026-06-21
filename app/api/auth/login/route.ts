import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

function getAdminCredentials() {
  const email = process.env.PB_ADMIN_EMAIL;
  const pass = process.env.PB_ADMIN_PASS;
  if (!email || !pass) throw new Error("PB_ADMIN_EMAIL and PB_ADMIN_PASS must be set in .env");
  return { email, pass };
}

function generateRandomPassword(): string {
  return crypto.randomBytes(24).toString("base64url");
}

async function pbFetch(path: string, options: RequestInit = {}) {
  return fetch(`${PB_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

async function getAdminToken(): Promise<string | null> {
  try {
    const creds = getAdminCredentials();
    const res = await pbFetch("/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body: JSON.stringify({ identity: creds.email, password: creds.pass }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.token;
    }
  } catch {}
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const adminToken = await getAdminToken();
    if (!adminToken) {
      return NextResponse.json({ error: "Admin auth failed" }, { status: 500 });
    }

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Find existing user via admin API
    let user: Record<string, unknown> | null = null;
    const searchRes = await pbFetch(
      `/api/collections/users/records?filter=email='${encodeURIComponent(email)}'`,
      { headers: adminHeaders }
    );
    if (searchRes.ok) {
      const data = await searchRes.json();
      user = data.items?.[0] || null;
    }

    if (!user) {
      // Create new user with random password (passwordless auth via this route)
      const randomPass = generateRandomPassword();
      const createRes = await pbFetch("/api/collections/users/records", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          email,
          password: randomPass,
          passwordConfirm: randomPass,
          name: name || email.split("@")[0],
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        console.error("User creation failed:", JSON.stringify(errData));
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }

      user = await createRes.json();
    }

    // Reset password to a fresh random value before auth (ensures auth works)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 500 });
    }
    const freshPass = generateRandomPassword();
    await pbFetch(`/api/collections/users/records/${user.id}`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({
        password: freshPass,
        passwordConfirm: freshPass,
      }),
    });

    // Authenticate as user
    const authRes = await pbFetch("/api/collections/users/auth-with-password", {
      method: "POST",
      body: JSON.stringify({ identity: email, password: freshPass }),
    });

    if (!authRes.ok) {
      const authErr = await authRes.json();
      console.error("Auth failed:", JSON.stringify(authErr));
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }

    const authData = await authRes.json();

    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name || email.split("@")[0],
        role: authData.record.role || "user",
        tier: authData.record.tier || "free",
        creditsRemaining: authData.record.creditsRemaining ?? 50,
      },
    });

    response.cookies.set("pb_auth", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Login error:", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
