import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { memoryCache } from "@/lib/cache";
import { rateLimiter } from "@/lib/rate-limiter";
import { vectorStore } from "@/lib/rag/vector-store";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const user = await requireAuth();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    cache: memoryCache.stats(),
    rateLimiter: rateLimiter.stats(),
    vectorStore: vectorStore.stats(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
    uptime: Math.round(process.uptime()) + "s",
    timestamp: new Date().toISOString(),
  });
}
