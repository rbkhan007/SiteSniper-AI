import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

export async function GET() {
  try {
    const pb = new PocketBase(PB_URL);
    await pb.health.check();
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
