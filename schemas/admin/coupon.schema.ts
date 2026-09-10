import { z } from "zod";

export const couponAdminSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]+$/, "Code can only contain letters and numbers"),
  description: z.string().trim().optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().positive("Discount value must be greater than 0"),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  usageLimit: z.coerce.number().int().positive().optional(),
  perUserLimit: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});
export type CouponAdminInput = z.infer<typeof couponAdminSchema>;
