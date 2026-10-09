import { z } from "zod";
import { imageRefSchema } from "@/schemas/image-ref";

export const bannerAdminSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  imageUrl: imageRefSchema.refine((v) => v.length > 0, "Upload an image first"),
  mobileImageUrl: imageRefSchema.optional().or(z.literal("")),
  linkUrl: z.string().trim().optional().or(z.literal("")),
  placement: z.enum(["HOME_HERO", "HOME_PROMO", "CATEGORY_TOP", "MOBILE_STRIP"]),
  displayOrder: z.coerce.number().int().min(0).default(0),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});
export type BannerAdminFormInput = z.infer<typeof bannerAdminSchema>;
