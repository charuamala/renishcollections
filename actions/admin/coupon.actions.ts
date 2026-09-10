"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authorization";
import { logAdminAction } from "@/lib/audit";
import { couponAdminSchema } from "@/schemas/admin/coupon.schema";
import { createCouponAdmin, updateCouponAdmin, deleteCouponAdmin, toggleCouponActive } from "@/services/admin/coupon.service";

const COUPON_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export interface CouponFormState {
  error?: string;
  success?: boolean;
}

function parseForm(formData: FormData) {
  return couponAdminSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrderAmount: formData.get("minOrderAmount") || undefined,
    maxDiscountAmount: formData.get("maxDiscountAmount") || undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    usageLimit: formData.get("usageLimit") || undefined,
    perUserLimit: formData.get("perUserLimit") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCouponAction(_prevState: CouponFormState, formData: FormData): Promise<CouponFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the coupon details" };

  const user = await requireRole([...COUPON_ROLES]);
  try {
    const coupon = await createCouponAdmin(parsed.data);
    await logAdminAction({ adminId: user.id, action: "coupon.created", entityType: "Coupon", entityId: coupon.id });
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    throw error;
  }
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(
  id: string,
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the coupon details" };

  const user = await requireRole([...COUPON_ROLES]);
  try {
    await updateCouponAdmin(id, parsed.data);
    await logAdminAction({ adminId: user.id, action: "coupon.updated", entityType: "Coupon", entityId: id });
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    throw error;
  }
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  const user = await requireRole([...COUPON_ROLES]);
  await deleteCouponAdmin(id);
  await logAdminAction({ adminId: user.id, action: "coupon.deleted", entityType: "Coupon", entityId: id });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponActiveAction(id: string, isActive: boolean) {
  const user = await requireRole([...COUPON_ROLES]);
  await toggleCouponActive(id, isActive);
  await logAdminAction({
    adminId: user.id,
    action: isActive ? "coupon.activated" : "coupon.deactivated",
    entityType: "Coupon",
    entityId: id,
  });
  revalidatePath("/admin/coupons");
}
