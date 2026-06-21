import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken } from "@/lib/auth";
import { requireStripe, isStripeReady, PLANS } from "@/lib/stripe";
import { PBHttp } from "@/lib/pb-http";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const body: { tier?: string } = await request.json();
    const tier = body.tier;

    if (tier !== "growth" && tier !== "scale") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const plan = PLANS[tier as keyof typeof PLANS];

    if (!plan.priceId) {
      return NextResponse.json(
        {
          error: "Stripe is not configured for this tier. Set price IDs in .env.",
          details: isStripeReady()
            ? "STRIPE_SECRET_KEY is set but price IDs are missing."
            : "STRIPE_SECRET_KEY is not configured. Add it to .env to enable payments.",
        },
        { status: 503 }
      );
    }

    const stripe = requireStripe();

    const profile = await pb.collection("users").getOne(user.id);
    let customerId = profile.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await pb.collection("users").update(user.id, {
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        tier,
        creditsToAdd: plan.credits.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Stripe is not configured")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
