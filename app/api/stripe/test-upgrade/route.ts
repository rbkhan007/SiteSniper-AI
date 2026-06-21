import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

/**
 * DEV-ONLY: Simulates a Stripe upgrade without real payment.
 * Only works when STRIPE_SECRET_KEY is not configured.
 * Creates a subscription record and upgrades the user's tier.
 */
export async function POST(request: NextRequest) {
  try {
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "your_stripe_secret_key") {
      return NextResponse.json(
        { error: "This endpoint is only available in dev mode without Stripe configured." },
        { status: 403 }
      );
    }

    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const body: { tier?: string } = await request.json();
    const tier = body.tier;

    if (tier !== "growth" && tier !== "scale") {
      return NextResponse.json({ error: "Invalid tier. Must be 'growth' or 'scale'." }, { status: 400 });
    }

    const creditsToAdd = tier === "growth" ? 1000 : 3000;
    const now = new Date().toISOString();
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Create subscription record
    try {
      await pb.collection("subscriptions").create({
        user: user.id,
        tier,
        status: "active",
        stripeSubscriptionId: "dev_test_sub_" + Date.now(),
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      });
    } catch (e) {
      console.warn("Subscription record creation failed (non-critical):", e);
    }

    // Get current user profile
    const profile = await pb.collection("users").getOne(user.id);
    const currentCredits = profile.creditsRemaining || 0;
    const newCredits = currentCredits + creditsToAdd;

    // Update user tier and credits
    await pb.collection("users").update(user.id, {
      tier,
      creditsRemaining: newCredits,
    });

    // Create payment record (schema: user, amount, tier, status, stripeSessionId)
    try {
      await pb.collection("payments").create({
        user: user.id,
        amount: tier === "growth" ? 4900 : 9900,
        tier,
        status: "succeeded",
        stripeSessionId: "dev_test_sess_" + Date.now(),
        creditsAdded: creditsToAdd,
      });
    } catch (e) {
      console.warn("Payment record creation failed (non-critical):", e);
    }

    // Log credit transaction
    try {
      await pb.collection("credit_transactions").create({
        user: user.id,
        amount: creditsToAdd,
        type: "purchase",
        referenceId: "dev_test_" + Date.now(),
        description: `Dev test upgrade to ${tier} - ${creditsToAdd} credits`,
      });
    } catch (e) {
      console.warn("Credit transaction log failed (non-critical):", e);
    }

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${tier} (dev test mode)`,
      tier,
      creditsAdded: creditsToAdd,
      newCredits,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Test upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to test upgrade" },
      { status: 500 }
    );
  }
}
