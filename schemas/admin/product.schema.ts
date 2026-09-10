import { z } from "zod";

export const productVariantInputSchema = z.object({
  id: z.string().optional(), // present when editing an existing variant
  sku: z.string().trim().min(1, "Variant SKU is required"),
  color: z.string().trim().optional().or(z.literal("")),
  size: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().positive("Variant price must be greater than 0"),
  stock: z.coerce.number().int().min(0),
});
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;

export const productAdminSchema = z
  .object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional()
    .or(z.literal("")),
  sku: z.string().trim().min(1, "SKU is required"),
  categoryId: z.string().trim().min(1, "Select a category"),
  shortDescription: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),

  sellingPrice: z.coerce.number().positive("Selling price must be greater than 0"),
  originalPrice: z.coerce.number().positive("Original price must be greater than 0"),
  wholesalePrice: z.coerce.number().positive().optional(),

  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),

  fabric: z.string().trim().optional().or(z.literal("")),
  color: z.string().trim().optional().or(z.literal("")),
  sareeLength: z.string().trim().optional().or(z.literal("")),
  blouseIncluded: z.boolean().default(false),
  careInstructions: z.string().trim().optional().or(z.literal("")),

  tags: z.string().trim().optional().or(z.literal("")), // comma-separated in the form

  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),

  seoTitle: z.string().trim().optional().or(z.literal("")),
  seoDescription: z.string().trim().optional().or(z.literal("")),
  seoKeywords: z.string().trim().optional().or(z.literal("")),
  canonicalUrl: z.string().trim().optional().or(z.literal("")),
  ogImageUrl: z.string().trim().url().optional().or(z.literal("")),

  images: z.array(z.string().url()).default([]),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  variants: z.array(productVariantInputSchema).default([]),
  })
  .refine((data) => data.sellingPrice <= data.originalPrice, {
    message: "Selling price cannot be higher than the original price",
    path: ["sellingPrice"],
  });
export type ProductAdminInput = z.infer<typeof productAdminSchema>;
