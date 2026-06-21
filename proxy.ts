import { NextRequest, NextResponse } from "next/server";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login"];
const adminRoutes = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("pb_auth")?.value;

  let isAuthenticated = false;
  let userRole = "user";

  if (token) {
    try {
      const res = await fetch(`${PB_URL}/api/collections/users/auth-refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        isAuthenticated = true;
        userRole = data.record?.role || "user";
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin-only routes
  if (
    isAuthenticated &&
    adminRoutes.some((route) => pathname.startsWith(route)) &&
    userRole !== "admin"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/admin/:path*"],
};
