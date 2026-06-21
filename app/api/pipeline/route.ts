import { NextRequest, NextResponse } from "next/server";
import { requireAuth, hasPermission, getTierLimits, getAuthToken, getAdminPB } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";
import { scrapeWebsite, extractEmails } from "@/lib/scrape";
import { generateRoastAndEmail } from "@/lib/gemini";
import { resend } from "@/lib/resend";
import { memoryCache, cacheKeys, cacheTTL } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { sanitizeDomain, isValidDomain } from "@/lib/security";
import { rateLimiter } from "@/lib/rate-limiter";
import { track } from "@/lib/analytics";
import { deductCredit, refundCredit, logEmailSend } from "@/lib/db-optimizations";
import { ragEnhancedPipeline } from "@/lib/rag/rag-pipeline";
import { getUserApiKey } from "@/app/api/user-settings/route";
const log = logger.child("pipeline");

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";
    const rateCheck = rateLimiter.check("pipeline", ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const user = await requireAuth();
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const adminPb = await getAdminPB();

    const { domain, campaignId, senderName } = await request.json();

    if (!domain || !campaignId) {
      return NextResponse.json(
        { error: "Domain and campaignId required" },
        { status: 400 }
      );
    }

    const limits = getTierLimits(user.tier);

    const cleanDomain = sanitizeDomain(domain);
    if (!isValidDomain(cleanDomain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Fetch user's own OpenRouter API key if they have one
    const userApiKey = await getUserApiKey(user.id, "openrouter");

    log.info("Pipeline started", {
      domain: cleanDomain,
      userId: user.id,
      tier: user.tier,
      hasUserKey: !!userApiKey,
    });

    const cachedResult = memoryCache.get(cacheKeys.roast(cleanDomain));
    if (cachedResult) {
      log.info("Cache hit", { domain: cleanDomain });

      const deducted = await deductCredit(user.id, campaignId, "Cached roast for " + cleanDomain);
      if (!deducted) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 402 }
        );
      }

      const cached = cachedResult as {
        roast: string;
        emailSubject: string;
        emailBody: string;
        foundEmail: string | null;
      };

      const lead = await adminPb.collection("leads").create({
        campaign: campaignId,
        domain: cleanDomain,
        foundEmail: cached.foundEmail || "",
        viralRoast: cached.roast,
        outreachSubject: cached.emailSubject,
        outreachBody: cached.emailBody,
        status: "completed",
      });

      let emailSent = false;
      if (cached.foundEmail && limits.hasEmailDelivery) {
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: cached.foundEmail,
            subject: cached.emailSubject,
            text: cached.emailBody,
          });
          emailSent = true;

          await logEmailSend({
            leadId: lead.id,
            userId: user.id,
            toEmail: cached.foundEmail,
            subject: cached.emailSubject,
            status: "sent",
          });

          track.emailSent(cleanDomain, cached.foundEmail, user.id);
        } catch (emailError) {
          log.error("Email send failed (cached)", emailError as Error, { domain: cleanDomain });
        }
      }

      track.roast(cleanDomain, user.id);

      const durationMs = performance.now() - startTime;
      log.info("Pipeline completed (cached)", { domain: cleanDomain, durationMs });

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        emailSent,
        roast: cached.roast,
        cached: true,
        tier: user.tier,
      });
    }

    const deducted = await deductCredit(user.id, campaignId, "Roast for " + cleanDomain);
    if (!deducted) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    const lead = await adminPb.collection("leads").create({
      campaign: campaignId,
      domain: cleanDomain,
      status: "processing",
    });

    try {
      let result;

      if (limits.hasRagPipeline) {
        const ragResult = await ragEnhancedPipeline(
          cleanDomain,
          senderName || user.name || "SiteSniper User",
          userApiKey
        );
        result = {
          company_pain_point: ragResult.company_pain_point,
          brutal_viral_roast: ragResult.brutal_viral_roast,
          email_subject: ragResult.email_subject,
          email_body: ragResult.email_body,
          foundEmail: ragResult.foundEmail,
          ragUsed: ragResult.ragContextUsed > 0,
        };
      } else {
        const scrapedText = await scrapeWebsite(cleanDomain);
        const foundEmail = extractEmails(scrapedText);
        const aiResult = await generateRoastAndEmail(
          scrapedText,
          senderName || user.name || "SiteSniper User",
          userApiKey
        );
        result = {
          ...aiResult,
          foundEmail,
          ragUsed: false,
        };
      }

      const validatedRoast = result.brutal_viral_roast || "No roast generated";
      const validatedSubject = result.email_subject || "No subject";
      const validatedBody = result.email_body || "No email body generated";

      memoryCache.set(
        cacheKeys.roast(cleanDomain),
        {
          roast: validatedRoast,
          painPoint: result.company_pain_point,
          emailSubject: validatedSubject,
          emailBody: validatedBody,
          foundEmail: result.foundEmail,
        },
        cacheTTL.roast
      );

      const updatedLead = await adminPb.collection("leads").update(lead.id, {
        foundEmail: result.foundEmail || "",
        viralRoast: validatedRoast,
        outreachSubject: validatedSubject,
        outreachBody: validatedBody,
        status: "completed",
      });

      let emailSent = false;
      if (result.foundEmail && limits.hasEmailDelivery) {
        try {
          const emailResult = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: result.foundEmail,
            subject: validatedSubject,
            text: validatedBody,
          });
          emailSent = true;

          await logEmailSend({
            leadId: updatedLead.id,
            userId: user.id,
            toEmail: result.foundEmail,
            subject: validatedSubject,
            status: "sent",
            resendId: emailResult.data?.id ?? undefined,
          });

          track.emailSent(cleanDomain, result.foundEmail, user.id);
        } catch (emailError) {
          log.error("Email send failed", emailError as Error, { domain: cleanDomain });
        }
      }

      track.roast(cleanDomain, user.id);

      const durationMs = performance.now() - startTime;
      log.info("Pipeline completed", {
        domain: cleanDomain,
        durationMs,
        emailSent,
        tier: user.tier,
        ragUsed: result.ragUsed,
      });

      return NextResponse.json({
        success: true,
        leadId: updatedLead.id,
        emailSent,
        roast: validatedRoast,
        cached: false,
        ragUsed: result.ragUsed,
        tier: user.tier,
      });
    } catch (pipelineError) {
      await refundCredit(user.id, lead.id, "Refund for failed roast: " + cleanDomain);

      await adminPb.collection("leads").update(lead.id, { status: "failed" });

      log.error("Pipeline failed", pipelineError as Error, { domain: cleanDomain });
      throw pipelineError;
    }
  } catch (error) {
    const durationMs = performance.now() - startTime;
    log.error("Pipeline error", error as Error, { durationMs });

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Insufficient tier") {
      return NextResponse.json(
        { error: "Upgrade required for this feature", upgradeRequired: true },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Pipeline failed" },
      { status: 500 }
    );
  }
}
