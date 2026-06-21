import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getTierLimits, getAuthToken, getAdminPB } from "@/lib/auth";
import { sanitizeDomain, isValidDomain } from "@/lib/security";
import { PBHttp } from "@/lib/pb-http";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const adminPb = await getAdminPB();
    const { campaignId, domains } = await request.json();

    if (!campaignId || !domains || !Array.isArray(domains)) {
      return NextResponse.json(
        { error: "campaignId and domains array required" },
        { status: 400 }
      );
    }

    const limits = getTierLimits(user.tier);
    if (!limits.hasBulkUpload && user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Bulk upload requires Growth plan or higher",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const campaign = await pb.collection("campaigns").getOne(campaignId);
    if (!campaign || campaign.user !== user.id) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const currentLeads = await adminPb.collection("leads").getList(1, 1, {
      filter: "campaign = '" + campaignId + "'",
    });
    const currentLeadCount = currentLeads.totalItems;

    const sanitizedDomains = domains
      .map((d: string) => sanitizeDomain(d))
      .filter((d: string) => isValidDomain(d));

    if (limits.maxLeadsPerCampaign !== -1) {
      const totalAfterUpload = currentLeadCount + sanitizedDomains.length;
      if (totalAfterUpload > limits.maxLeadsPerCampaign) {
        return NextResponse.json(
          {
            error: "Campaign lead limit reached (" + limits.maxLeadsPerCampaign + "). Upgrade for more.",
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const leadData = sanitizedDomains.map((domain: string) => ({
      campaign: campaignId,
      domain,
      status: "pending",
    }));

    const results = await Promise.all(
      leadData.map((data) => adminPb.collection("leads").create(data))
    );

    return NextResponse.json({
      inserted: results.length,
      total: currentLeadCount + results.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload domains", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
