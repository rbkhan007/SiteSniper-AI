import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getTierLimits, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

export async function GET() {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);

    const campaignsData = await pb.collection("campaigns").getList(1, 100, {
      filter: "user = '" + user.id + "' && isArchived = false",
    });
    campaignsData.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

    const campaignsWithStats = await Promise.all(
      campaignsData.items.map(async (c) => {
        const leads = await pb.collection("leads").getList(1, 1000, {
          filter: "campaign = '" + c.id + "'",
        });

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          isArchived: c.isArchived,
          createdAt: c.created,
          updatedAt: c.updated,
          totalLeads: leads.totalItems,
          completedLeads: leads.items.filter((l) => l.status === "completed").length,
          failedLeads: leads.items.filter((l) => l.status === "failed").length,
          pendingLeads: leads.items.filter((l) => l.status === "pending").length,
          processingLeads: leads.items.filter((l) => l.status === "processing").length,
        };
      })
    );

    return NextResponse.json({
      campaigns: campaignsWithStats,
      limits: {
        maxCampaigns: getTierLimits(user.tier).maxCampaigns,
        currentCount: campaignsData.totalItems,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch campaigns", detail: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const limits = getTierLimits(user.tier);
    const countData = await pb.collection("campaigns").getList(1, 1, {
      filter: "user = '" + user.id + "'",
    });

    if (limits.maxCampaigns !== -1 && countData.totalItems >= limits.maxCampaigns) {
      return NextResponse.json(
        {
          error: `Campaign limit reached (${limits.maxCampaigns}). Upgrade your plan for more.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const created = await pb.collection("campaigns").create({
      user: user.id,
      title,
      description: description || "",
      isArchived: false,
    });

    return NextResponse.json({ campaign: created });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
