/**
 * RAG-Enhanced Pipeline
 * Combines vector search with LLM generation for better results
 */

import { vectorStore } from "./vector-store";
import { generateRoastAndEmail } from "../gemini";
import { scrapeWebsite, extractEmails } from "../scrape";

export interface RAGContext {
  domain: string;
  scrapedText: string;
  similarDomains: Array<{
    domain: string;
    analysis: string;
    score: number;
  }>;
}

export interface RAGResult {
  company_pain_point: string;
  brutal_viral_roast: string;
  email_subject: string;
  email_body: string;
  foundEmail: string | null;
  fromCache: boolean;
  ragContextUsed: number;
}

/**
 * Enhanced pipeline with RAG context
 */
export async function ragEnhancedPipeline(
  domain: string,
  senderName: string,
  userApiKey?: string | null
): Promise<RAGResult> {
  // Check cache first
  const cached = vectorStore.getCached(domain);
  if (cached) {
    const cachedData = cached.metadata.result as Omit<RAGResult, "fromCache" | "ragContextUsed">;
    return {
      ...cachedData,
      fromCache: true,
      ragContextUsed: 0,
    };
  }

  // Scrape the website
  const scrapedText = await scrapeWebsite(domain);
  const foundEmail = extractEmails(scrapedText);

  // Search for similar domain analyses in vector store
  const similarResults = await vectorStore.search(scrapedText, 3, 0.6);

  const ragContext = similarResults.map((r) => ({
    domain: (r.metadata.domain as string) || "unknown",
    analysis: r.text,
    score: r.score,
  }));

  // Build enhanced prompt with RAG context
  let ragPromptAddon = "";
  if (ragContext.length > 0) {
    ragPromptAddon = `\n\nFor reference, here are analyses of similar companies:\n${ragContext
      .map(
        (ctx, i) =>
          `[${i + 1}] Similar company "${ctx.domain}" (similarity: ${(ctx.score * 100).toFixed(0)}%):\n${ctx.analysis}`
      )
      .join("\n\n")}\n\nUse these as context to improve your analysis, but generate unique content for the target domain.`;
  }

  // Generate with enhanced prompt
  const enhancedScrapedText = scrapedText + ragPromptAddon;
  const result = await generateRoastAndEmail(enhancedScrapedText, senderName, userApiKey);

  // Store the analysis in vector store for future RAG queries
  const analysisText = `${result.company_pain_point} ${result.brutal_viral_roast} ${result.email_body}`;
  await vectorStore.add(`analysis:${domain}:${Date.now()}`, analysisText, {
    domain,
    type: "analysis",
    result,
  });

  // Store the scraped content for similar domain matching
  await vectorStore.add(`content:${domain}:${Date.now()}`, scrapedText, {
    domain,
    type: "content",
  });

  return {
    ...result,
    foundEmail,
    fromCache: false,
    ragContextUsed: ragContext.length,
  };
}
