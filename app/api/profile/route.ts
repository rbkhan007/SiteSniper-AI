import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getFullProfile, hasPermission, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await getFullProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile,
      permissions: {
        hasApiAccess: hasPermission(user, "hasApiAccess"),
        hasBulkUpload: hasPermission(user, "hasBulkUpload"),
        hasEmailDelivery: hasPermission(user, "hasEmailDelivery"),
        hasPriorityProcessing: hasPermission(user, "hasPriorityProcessing"),
        hasRagPipeline: hasPermission(user, "hasRagPipeline"),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const body = await request.json();

    const updated = await pb.collection("users").update(user.id, {
      ...(body.name !== undefined && { name: body.name || "" }),
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
