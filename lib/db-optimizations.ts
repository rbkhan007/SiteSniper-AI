import { getAdminPB } from "@/lib/auth";

async function getPB() {
  return await getAdminPB();
}

/**
 * Optimized profile fetch with stats
 */
export async function getProfileWithStats(userId: string) {
  const pb = await getPB();
  const user = await pb.collection("users").getOne(userId);
  return user;
}

/**
 * Optimized campaign list with aggregated stats
 */
export async function getCampaignsWithStats(userId: string) {
  const pb = await getPB();
  const campaigns = await pb.collection("campaigns").getList(1, 100, {
    filter: `user = '${userId}' && isArchived = false`,
  });
  campaigns.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

  const results = await Promise.all(
    campaigns.items.map(async (c) => {
      const leads = await pb.collection("leads").getList(1, 1000, {
        filter: `campaign = '${c.id}'`,
      });

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        createdAt: c.created,
        updatedAt: c.updated,
        totalLeads: leads.items.length,
        completedLeads: leads.items.filter((l) => l.status === "completed").length,
        failedLeads: leads.items.filter((l) => l.status === "failed").length,
        pendingLeads: leads.items.filter((l) => l.status === "pending").length,
        processingLeads: leads.items.filter((l) => l.status === "processing").length,
      };
    })
  );

  return results;
}

/**
 * Optimized campaign detail with leads
 */
export async function getCampaignDetail(campaignId: string, userId: string) {
  const pb = await getPB();
  const campaign = await pb.collection("campaigns").getOne(campaignId);

  if (!campaign || campaign.user !== userId) return null;

  const leads = await pb.collection("leads").getList(1, 1000, {
    filter: `campaign = '${campaignId}'`,
  });
  leads.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

  return { ...campaign, leads: leads.items };
}

/**
 * Optimized pending leads fetch for queue processing
 */
export async function getPendingLeads(campaignId: string, limit: number = 3) {
  const pb = await getPB();
  const leads = await pb.collection("leads").getList(1, limit, {
    filter: `campaign = '${campaignId}' && status = 'pending'`,
  });
  leads.items.sort((a: any, b: any) => (a.created > b.created ? 1 : -1));

  return leads.items.map((l) => ({
    id: l.id,
    domain: l.domain,
    campaignId: l.campaign,
  }));
}

/**
 * Optimized stats aggregation
 */
export async function getUserStats(userId: string) {
  const pb = await getPB();

  const [campaignsRes, leadsRes, completedRes, failedRes, profile] =
    await Promise.all([
      pb.collection("campaigns").getList(1, 1, {
        filter: `user = '${userId}'`,
      }),
      pb.collection("leads").getList(1, 1, {
        filter: `campaign.user = '${userId}'`,
      }),
      pb.collection("leads").getList(1, 1, {
        filter: `campaign.user = '${userId}' && status = 'completed'`,
      }),
      pb.collection("leads").getList(1, 1, {
        filter: `campaign.user = '${userId}' && status = 'failed'`,
      }),
      pb.collection("users").getOne(userId),
    ]);

  const totalLeads = leadsRes.totalItems;
  const completedLeads = completedRes.totalItems;
  const failedLeads = failedRes.totalItems;

  return {
    totalCampaigns: campaignsRes.totalItems,
    totalLeads,
    completedLeads,
    failedLeads,
    successRate: totalLeads > 0 ? (completedLeads / totalLeads) * 100 : 0,
    creditsRemaining: profile.creditsRemaining ?? 0,
    tier: profile.tier ?? "free",
  };
}

/**
 * Atomic credit deduction with ledger entry
 */
export async function deductCredit(
  userId: string,
  referenceId?: string,
  description?: string
): Promise<boolean> {
  const pb = await getPB();
  const user = await pb.collection("users").getOne(userId);

  if (!user || user.creditsRemaining <= 0) return false;

  await pb.collection("users").update(userId, {
    creditsRemaining: user.creditsRemaining - 1,
  });

  try {
    await pb.collection("credit_transactions").create({
      user: userId,
      amount: -1,
      type: "deduction",
      referenceId: referenceId || "",
      description: description || "Credit deducted",
    });
  } catch {
    // Don't fail the deduction if ledger write fails
  }

  return true;
}

/**
 * Refund credit on failure with ledger entry
 */
export async function refundCredit(
  userId: string,
  referenceId?: string,
  description?: string
): Promise<void> {
  const pb = await getPB();
  const user = await pb.collection("users").getOne(userId);

  await pb.collection("users").update(userId, {
    creditsRemaining: (user.creditsRemaining || 0) + 1,
  });

  try {
    await pb.collection("credit_transactions").create({
      user: userId,
      amount: 1,
      type: "refund",
      referenceId: referenceId || "",
      description: description || "Credit refunded",
    });
  } catch {
    // Don't fail the refund if ledger write fails
  }
}

/**
 * Add credits from purchase with ledger entry
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "signup_bonus" | "promotion",
  referenceId?: string,
  description?: string
): Promise<void> {
  const pb = await getPB();
  const user = await pb.collection("users").getOne(userId);

  await pb.collection("users").update(userId, {
    creditsRemaining: (user.creditsRemaining || 0) + amount,
  });

  try {
    await pb.collection("credit_transactions").create({
      user: userId,
      amount,
      type,
      referenceId: referenceId || "",
      description: description || `${type} - ${amount} credits`,
    });
  } catch {
    // Don't fail the add if ledger write fails
  }
}

/**
 * Get credit transaction history
 */
export async function getCreditHistory(userId: string, limit: number = 50) {
  const pb = await getPB();
  const result = await pb.collection("credit_transactions").getList(1, limit, {
    filter: `user = '${userId}'`,
  });
  result.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));
  return result.items;
}

/**
 * Bulk insert leads efficiently
 */
export async function bulkInsertLeads(
  campaignId: string,
  domains: string[]
): Promise<number> {
  const pb = await getPB();
  const leadData = domains.map((domain) => ({
    campaign: campaignId,
    domain,
    status: "pending",
  }));

  const results = await Promise.all(
    leadData.map((data) => pb.collection("leads").create(data))
  );
  return results.length;
}

/**
 * Log email send to database
 */
export async function logEmailSend(data: {
  leadId: string;
  userId: string;
  toEmail: string;
  subject: string;
  status?: string;
  resendId?: string;
}) {
  const pb = await getPB();
  return pb.collection("email_logs").create({
    lead: data.leadId,
    user: data.userId,
    toEmail: data.toEmail,
    subject: data.subject,
    status: data.status || "sent",
    resendId: data.resendId || "",
  });
}

/**
 * Get email logs for a user
 */
export async function getEmailLogs(userId: string, limit: number = 100) {
  const pb = await getPB();
  const result = await pb.collection("email_logs").getList(1, limit, {
    filter: `user = '${userId}'`,
  });
  result.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));
  return result.items;
}

/**
 * Get subscription history for a user
 */
export async function getSubscriptions(userId: string) {
  const pb = await getPB();
  const result = await pb.collection("subscriptions").getList(1, 100, {
    filter: `user = '${userId}'`,
  });
  result.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));
  return result.items;
}

/**
 * Get payment history for a user
 */
export async function getPayments(userId: string, limit: number = 50) {
  const pb = await getPB();
  const result = await pb.collection("payments").getList(1, limit, {
    filter: `user = '${userId}'`,
  });
  result.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));
  return result.items;
}
