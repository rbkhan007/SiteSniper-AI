import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const token = await getAuthToken();
    const pb = new PBHttp(token);

    const lead = await pb.collection("leads").getOne(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Verify campaign ownership
    const campaign = await pb.collection("campaigns").getOne(lead.campaign);
    if (!campaign || campaign.user !== user.id) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}
