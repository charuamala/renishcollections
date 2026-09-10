import "server-only";
import { prisma } from "@/lib/prisma";
import type { CouponAdminInput } from "@/schemas/admin/coupon.schema";

export async function listCouponsForAdmin() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

function toData(input: CouponAdminInput) {
  return {
    code: input.code,
    description: input.description || null,
    discountType: input.discountType,
    discountValue: input.discountValue,
    minOrderAmount: input.minOrderAmount ?? null,
    maxDiscountAmount: input.maxDiscountAmount ?? null,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    usageLimit: input.usageLimit ?? null,
    perUserLimit: input.perUserLimit ?? null,
    isActive: input.isActive,
  };
}

export async function createCouponAdmin(input: CouponAdminInput) {
  const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
  if (existing) throw new Error(`Coupon code "${input.code}" already exists`);
  return prisma.coupon.create({ data: toData(input) });
}

export async function updateCouponAdmin(id: string, input: CouponAdminInput) {
  const existing = await prisma.coupon.findFirst({ where: { code: input.code, id: { not: id } } });
  if (existing) throw new Error(`Coupon code "${input.code}" already exists`);
  return prisma.coupon.update({ where: { id }, data: toData(input) });
}

export async function deleteCouponAdmin(id: string) {
  await prisma.coupon.delete({ where: { id } });
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  return prisma.coupon.update({ where: { id }, data: { isActive } });
}
