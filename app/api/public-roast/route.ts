import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite, extractEmails } from "@/lib/scrape";
import { generateRoastAndEmail } from "@/lib/gemini";
import { memoryCache, cacheKeys, cacheTTL } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { sanitizeDomain, isValidDomain } from "@/lib/security";
import { rateLimiter } from "@/lib/rate-limiter";
import { track } from "@/lib/analytics";

const log = logger.child("public-roast");

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";
    const rateCheck = rateLimiter.check("public-api", ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    // Sanitize and validate domain
    const cleanDomain = sanitizeDomain(domain);
    if (!isValidDomain(cleanDomain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    log.info("Public roast started", { domain: cleanDomain });

    // Check cache first
    const cached = memoryCache.get<{
      roast: string;
      painPoint: string;
      emailSubject: string;
      emailBody: string;
      foundEmail: string | null;
    }>(cacheKeys.roast(cleanDomain));

    if (cached) {
      log.info("Cache hit", { domain: cleanDomain });
      track.roast(cleanDomain);

      const durationMs = performance.now() - startTime;
      log.info("Public roast completed (cached)", {
        domain: cleanDomain,
        durationMs,
      });

      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // Scrape the website
    const scrapedText = await scrapeWebsite(cleanDomain);
    const email = extractEmails(scrapedText);

    // Generate AI content
    const result = await generateRoastAndEmail(
      scrapedText,
      "SiteSniper Team"
    );

    const responseData = {
      roast: result.brutal_viral_roast,
      painPoint: result.company_pain_point,
      emailSubject: result.email_subject,
      emailBody: result.email_body,
      foundEmail: email,
    };

    // Cache the result
    memoryCache.set(
      cacheKeys.roast(cleanDomain),
      responseData,
      cacheTTL.roast
    );

    track.roast(cleanDomain);

    const durationMs = performance.now() - startTime;
    log.info("Public roast completed", { domain: cleanDomain, durationMs });

    return NextResponse.json({
      ...responseData,
      cached: false,
    });
  } catch (error) {
    const durationMs = performance.now() - startTime;
    log.error("Public roast error", error as Error, { durationMs });

    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 }
    );
  }
}
