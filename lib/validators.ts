import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export const roastSchema = z.object({
  domain: z.string().min(1, "Domain is required").regex(
    /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Invalid domain format"
  ),
});

export const pipelineSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  senderName: z.string().optional(),
});

export const bulkUploadSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  domains: z.array(z.string()).min(1, "At least one domain required"),
});

export const campaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
});

export const checkoutSchema = z.object({
  tier: z.enum(["growth", "scale"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RoastInput = z.infer<typeof roastSchema>;
export type PipelineInput = z.infer<typeof pipelineSchema>;
export type BulkUploadInput = z.infer<typeof bulkUploadSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
