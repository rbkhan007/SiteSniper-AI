import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const token = await getAuthToken();
    const pb = new PBHttp(token);

    if (!campaignId) {
      return NextResponse.json(
        { error: "CampaignId required" },
        { status: 400 }
      );
    }

    const leads = await pb.collection("leads").getList(1, 1000, {
      filter: "campaign = '" + campaignId + "'",
    });
    leads.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

    return NextResponse.json({ leads: leads.items });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
