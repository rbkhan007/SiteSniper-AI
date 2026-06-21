import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { getAdminPB, syncTierFromSubscription } from "@/lib/auth";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = requireStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const pb = await getAdminPB();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tier, creditsToAdd } = session.metadata || {};

    if (userId && creditsToAdd) {
      // Update profile
      await pb.collection("users").update(userId, {
        creditsRemaining: parseInt(creditsToAdd),
        stripeCustomerId: session.customer as string,
      });

      // Log payment
      await pb.collection("payments").create({
        user: userId,
        stripeSessionId: session.id,
        stripeInvoiceId: (session.invoice as string) ?? "",
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        tier: tier ?? "growth",
        creditsAdded: parseInt(creditsToAdd),
        status: "succeeded",
      });

      // Create or update subscription record
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const firstItem = subscription.items.data[0];
        const periodStart = firstItem?.current_period_start
          ? new Date(firstItem.current_period_start * 1000).toISOString()
          : undefined;
        const periodEnd = firstItem?.current_period_end
          ? new Date(firstItem.current_period_end * 1000).toISOString()
          : undefined;

        // Try to find existing subscription
        const existingSubs = await pb.collection("subscriptions").getList(1, 1, {
          filter: `stripeSubscriptionId = '${session.subscription}'`,
        });

        if (existingSubs.items.length > 0) {
          await pb.collection("subscriptions").update(existingSubs.items[0].id, {
            status: "active",
            creditsPerPeriod: parseInt(creditsToAdd),
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          });
        } else {
          await pb.collection("subscriptions").create({
            user: userId,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: firstItem?.price?.id || "",
            tier: tier ?? "growth",
            status: "active",
            creditsPerPeriod: parseInt(creditsToAdd),
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          });
        }
      }

      // Log credit addition
      await pb.collection("credit_transactions").create({
        user: userId,
        amount: parseInt(creditsToAdd),
        type: "purchase",
        referenceId: session.id,
        description: `Purchased ${tier} plan`,
      });

      // Sync tier from subscription
      await syncTierFromSubscription(userId);

      console.log(
        `User ${userId} upgraded to ${tier}, added ${creditsToAdd} credits`
      );
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;

    if (userId) {
      const firstItem = subscription.items.data[0];
      const periodStart = firstItem?.current_period_start
        ? new Date(firstItem.current_period_start * 1000).toISOString()
        : undefined;
      const periodEnd = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000).toISOString()
        : undefined;

      const existingSubs = await pb.collection("subscriptions").getList(1, 1, {
        filter: `stripeSubscriptionId = '${subscription.id}'`,
      });

      if (existingSubs.items.length > 0) {
        await pb.collection("subscriptions").update(existingSubs.items[0].id, {
          status: subscription.status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });
      }

      await syncTierFromSubscription(userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    const existingSubs = await pb.collection("subscriptions").getList(1, 1, {
      filter: `stripeSubscriptionId = '${subscription.id}'`,
    });

    if (existingSubs.items.length > 0) {
      await pb.collection("subscriptions").update(existingSubs.items[0].id, {
        status: "canceled",
      });
    }

    const userId = subscription.metadata?.userId;
    if (userId) {
      await syncTierFromSubscription(userId);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.parent?.subscription_details?.subscription;

    if (subscriptionId && typeof subscriptionId === "string") {
      const existingSubs = await pb.collection("subscriptions").getList(1, 1, {
        filter: `stripeSubscriptionId = '${subscriptionId}'`,
      });

      if (existingSubs.items.length > 0) {
        await pb.collection("subscriptions").update(existingSubs.items[0].id, {
          status: "past_due",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
