import * as cheerio from "cheerio";

export async function scrapeWebsite(domain: string): Promise<string> {
  const url = domain.startsWith("http") ? domain : `https://${domain}`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SiteSniperBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, iframe, noscript").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    return text.substring(0, 3500);
  } finally {
    clearTimeout(timeout);
  }
}

export function extractEmails(html: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const genericPrefixes = [
    "info",
    "noreply",
    "no-reply",
    "support",
    "admin",
    "webmaster",
    "postmaster",
    "abuse",
    "billing",
    "help",
  ];

  const emails = html.match(emailRegex) || [];

  const validEmail = emails.find((email) => {
    const prefix = email.split("@")[0].toLowerCase();
    return !genericPrefixes.includes(prefix);
  });

  return validEmail || null;
}
