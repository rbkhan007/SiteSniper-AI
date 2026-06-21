import { NextResponse } from "next/server";
import { requireAuth, hasPermission, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

export async function GET() {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);

    const [campaignsRes, leadsRes, profile, paymentsRes, subsRes, emailLogRes] =
      await Promise.all([
        pb.collection("campaigns").getList(1, 1, {
          filter: "user = '" + user.id + "'",
        }),
        pb.collection("leads").getList(1, 1, {
          filter: "campaign.user = '" + user.id + "'",
        }),
        pb.collection("users").getOne(user.id),
        pb.collection("payments").getList(1, 20, {
          filter: "user = '" + user.id + "'",
        }),
        pb.collection("subscriptions").getList(1, 10, {
          filter: "user = '" + user.id + "'",
        }),
        pb.collection("email_logs").getList(1, 1, {
          filter: "user = '" + user.id + "'",
        }),
      ]);

    // Get completed and failed counts
    const completedLeads = await pb.collection("leads").getList(1, 1, {
      filter: "campaign.user = '" + user.id + "' && status = 'completed'",
    });
    const failedLeads = await pb.collection("leads").getList(1, 1, {
      filter: "campaign.user = '" + user.id + "' && status = 'failed'",
    });

    paymentsRes.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));
    subsRes.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

    const totalLeads = leadsRes.totalItems;

    return NextResponse.json({
      stats: {
        totalCampaigns: campaignsRes.totalItems,
        totalLeads,
        completedLeads: completedLeads.totalItems,
        failedLeads: failedLeads.totalItems,
        successRate:
          totalLeads > 0
            ? Math.round((completedLeads.totalItems / totalLeads) * 100)
            : 0,
        creditsRemaining: profile.creditsRemaining ?? 0,
        tier: profile.tier ?? "free",
        emailLogCount: emailLogRes.totalItems,
      },
      permissions: {
        hasApiAccess: hasPermission(user, "hasApiAccess"),
        hasBulkUpload: hasPermission(user, "hasBulkUpload"),
        hasEmailDelivery: hasPermission(user, "hasEmailDelivery"),
        hasPriorityProcessing: hasPermission(user, "hasPriorityProcessing"),
        hasRagPipeline: hasPermission(user, "hasRagPipeline"),
      },
      payments: paymentsRes.items,
      subscriptions: subsRes.items,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
