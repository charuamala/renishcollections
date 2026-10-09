import { z } from "zod";
import { imageRefSchema as imageRef } from "@/schemas/image-ref";

export const categoryAdminSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  imageUrl: imageRef.optional().or(z.literal("")),
  galleryImages: z.array(imageRef).max(12, "Up to 12 extra photos").default([]),
  parentId: z.string().trim().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  seoTitle: z.string().trim().optional().or(z.literal("")),
  seoDescription: z.string().trim().optional().or(z.literal("")),
});
export type CategoryAdminInput = z.infer<typeof categoryAdminSchema>;
