const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite-preview-09-2025";

interface GeminiResponse {
  company_pain_point: string;
  brutal_viral_roast: string;
  email_subject: string;
  email_body: string;
}

function getOpenRouterKey(userKey?: string | null): string {
  if (userKey && userKey.startsWith("sk-or-")) return userKey;
  const key = process.env.OpenRouter_API_KEY;
  if (!key || key === "your_openrouter_api_key") {
    throw new Error("OpenRouter API key not configured. Set OpenRouter_API_KEY in .env or add your key in Settings.");
  }
  return key;
}

export async function generateRoastAndEmail(
  scrapedText: string,
  senderName: string,
  userApiKey?: string | null
): Promise<GeminiResponse> {
  const prompt = `You are an elite B2B Growth Hacker and Conversational Copywriter.
Your task is to analyze raw HTML/Text scraped from a target company
website and generate structured sales collateral.

Analyze this raw company data:
###
${scrapedText}
###

You must output exactly and strictly a JSON object with no additional
markdown wrappers, formatting, or commentary. The JSON structure must
match this schema exactly:

{
  "company_pain_point": "A single sentence detailing the main bottleneck, outdated tech, or problem this company faces based on their copy.",
  "brutal_viral_roast": "A short, witty, highly engaging, and sarcastic 2-sentence roast of their current positioning or design.",
  "email_subject": "A compelling, casual, and low-friction email subject line (under 6 words). Do not use clickbait or emojis.",
  "email_body": "A concise 3-sentence email pitch written from ${senderName}. Sentence 1: Complement their business context natively. Sentence 2: Softly point out the pain point you found. Sentence 3: End with a zero-friction call to action asking for a 5-minute sync."
}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getOpenRouterKey(userApiKey)}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "SiteSniper AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No text in OpenRouter response");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in OpenRouter response");
  }

  return JSON.parse(jsonMatch[0]);
}
