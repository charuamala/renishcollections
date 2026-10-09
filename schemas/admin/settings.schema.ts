import { z } from "zod";

export const siteSettingsSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required"),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  faviconUrl: z.string().trim().url().optional().or(z.literal("")),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  whatsappNumber: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  legalName: z.string().trim().optional().or(z.literal("")),
  supportHours: z.string().trim().optional().or(z.literal("")),
  grievanceOfficerName: z.string().trim().optional().or(z.literal("")),
  grievanceOfficerEmail: z.string().trim().email().optional().or(z.literal("")),
  deliveryTime: z.string().trim().optional().or(z.literal("")),
  returnPolicy: z.string().trim().optional().or(z.literal("")),
  codAvailable: z.boolean().default(false),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  youtubeUrl: z.string().trim().url().optional().or(z.literal("")),
  whatsappUrl: z.string().trim().url().optional().or(z.literal("")),
  taxPercentage: z.coerce.number().min(0).max(100).default(0),
  freeShippingThreshold: z.coerce.number().min(0).optional(),
  seoDefaultTitle: z.string().trim().optional().or(z.literal("")),
  seoDefaultDescription: z.string().trim().optional().or(z.literal("")),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
