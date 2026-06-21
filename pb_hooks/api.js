// pb_hooks/api.js
// Custom API routes for SiteSniper AI
// These extend PocketBase's built-in CRUD with business logic

const router = require(`${__hooks}/lib/router.js`);

// ─── Pipeline Route ─────────────────────────────────────────────────
router.add("POST", "/api/pipeline", async (e) => {
  const { request, response } = e;
  const pb = e.pb;

  try {
    const authRecord = request.authRecord;
    if (!authRecord) {
      return response.json({ error: "Unauthorized" }, 401);
    }

    const body = request.body || {};
    const { domain, campaignId, senderName } = body;

    if (!domain || !campaignId) {
      return response.json({ error: "Domain and campaignId required" }, 400);
    }

    // Sanitize domain
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").toLowerCase();
    if (!cleanDomain || !cleanDomain.includes(".")) {
      return response.json({ error: "Invalid domain format" }, 400);
    }

    // Check credits
    const user = pb.collection("users").getOne(authRecord.id);
    if (!user || user.creditsRemaining <= 0) {
      return response.json({ error: "Insufficient credits" }, 402);
    }

    // Deduct credit
    pb.collection("users").update(authRecord.id, {
      creditsRemaining: user.creditsRemaining - 1,
    });

    // Log credit deduction
    pb.collection("credit_transactions").create({
      user: authRecord.id,
      amount: -1,
      type: "deduction",
      description: `Roast for ${cleanDomain}`,
    });

    // Create lead
    const lead = pb.collection("leads").create({
      campaign: campaignId,
      domain: cleanDomain,
      status: "processing",
    });

    // TODO: Integrate with Gemini API for actual analysis
    // For now, return a mock result
    const mockResult = {
      roast: `Analyzing ${cleanDomain}...`,
      painPoint: "Identifying pain points...",
      emailSubject: "Partnership Opportunity",
      emailBody: "Hi, I noticed some opportunities on your website...",
      foundEmail: null,
    };

    // Update lead with results
    pb.collection("leads").update(lead.id, {
      viralRoast: mockResult.roast,
      outreachSubject: mockResult.emailSubject,
      outreachBody: mockResult.emailBody,
      foundEmail: mockResult.foundEmail,
      status: "completed",
    });

    return response.json({
      success: true,
      leadId: lead.id,
      emailSent: false,
      roast: mockResult.roast,
      cached: false,
    });
  } catch (err) {
    console.error("Pipeline error:", err);
    return response.json({ error: "Pipeline failed" }, 500);
  }
});

// ─── Bulk Upload Route ──────────────────────────────────────────────
router.add("POST", "/api/bulk-upload", async (e) => {
  const { request, response } = e;
  const pb = e.pb;

  try {
    const authRecord = request.authRecord;
    if (!authRecord) {
      return response.json({ error: "Unauthorized" }, 401);
    }

    const body = request.body || {};
    const { campaignId, domains } = body;

    if (!campaignId || !domains || !Array.isArray(domains)) {
      return response.json({ error: "campaignId and domains array required" }, 400);
    }

    // Verify campaign belongs to user
    const campaign = pb.collection("campaigns").getOne(campaignId);
    if (!campaign || campaign.user !== authRecord.id) {
      return response.json({ error: "Campaign not found" }, 404);
    }

    // Sanitize and filter domains
    const sanitizedDomains = domains
      .map((d) => d.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").toLowerCase())
      .filter((d) => d && d.includes("."));

    // Bulk insert leads
    const leads = sanitizedDomains.map((domain) => ({
      campaign: campaignId,
      domain,
      status: "pending",
    }));

    const result = pb.collection("leads").createMany(leads);

    return response.json({
      inserted: result.length,
      total: result.length,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return response.json({ error: "Failed to upload domains" }, 500);
  }
});

// ─── Stripe Checkout Route ──────────────────────────────────────────
router.add("POST", "/api/stripe/checkout", async (e) => {
  const { request, response } = e;
  const pb = e.pb;

  try {
    const authRecord = request.authRecord;
    if (!authRecord) {
      return response.json({ error: "Unauthorized" }, 401);
    }

    const body = request.body || {};
    const { tier } = body;

    if (!tier || !["growth", "scale"].includes(tier)) {
      return response.json({ error: "Invalid tier" }, 400);
    }

    // TODO: Create Stripe checkout session
    // For now, return mock URL
    const prices = {
      growth: process.env.STRIPE_PRICE_GROWTH,
      scale: process.env.STRIPE_PRICE_SCALE,
    };

    return response.json({
      url: `/dashboard/billing?upgrading=${tier}`,
      message: "Stripe integration pending",
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return response.json({ error: "Checkout failed" }, 500);
  }
});

// ─── Public Roast Route (no auth required) ──────────────────────────
router.add("POST", "/api/public-roast", async (e) => {
  const { request, response } = e;
  const pb = e.pb;

  try {
    const body = request.body || {};
    const { domain } = body;

    if (!domain) {
      return response.json({ error: "Domain required" }, 400);
    }

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").toLowerCase();
    if (!cleanDomain || !cleanDomain.includes(".")) {
      return response.json({ error: "Invalid domain format" }, 400);
    }

    // TODO: Integrate with Gemini API
    const mockResult = {
      roast: `Analyzing ${cleanDomain}... This site has some interesting opportunities for improvement.`,
      painPoint: "Based on the analysis, there are areas where the website could better communicate its value proposition.",
      emailSubject: "Quick thought on your website",
      emailBody: `Hi, I was looking at ${cleanDomain} and noticed a few things that could help you convert more visitors.`,
      foundEmail: null,
    };

    return response.json(mockResult);
  } catch (err) {
    console.error("Public roast error:", err);
    return response.json({ error: "Failed to analyze" }, 500);
  }
});

// ─── Get Pending Leads Route ────────────────────────────────────────
router.add("GET", "/api/get-pending-leads", async (e) => {
  const { request, response } = e;
  const pb = e.pb;

  try {
    const authRecord = request.authRecord;
    if (!authRecord) {
      return response.json({ error: "Unauthorized" }, 401);
    }

    const campaignId = request.query?.campaignId;
    const limit = parseInt(request.query?.limit || "3");

    if (!campaignId) {
      return response.json({ error: "campaignId required" }, 400);
    }

    const leads = pb.collection("leads").getList(1, limit, {
      filter: `campaign = '${campaignId}' && status = 'pending'`,
      sort: "created",
    });

    return response.json({ leads: leads.items });
  } catch (err) {
    console.error("Get pending leads error:", err);
    return response.json({ error: "Failed to fetch leads" }, 500);
  }
});
