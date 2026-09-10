import type { Metadata } from "next";
import { listCouponsForAdmin } from "@/services/admin/coupon.service";
import { CouponList } from "@/components/admin/coupon-list";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

export default async function AdminCouponsPage() {
  const coupons = await listCouponsForAdmin();
  return (
    <CouponList
      coupons={coupons.map((c) => ({
        ...c,
        discountValue: c.discountValue.toString(),
        minOrderAmount: c.minOrderAmount?.toString() ?? null,
        maxDiscountAmount: c.maxDiscountAmount?.toString() ?? null,
      }))}
    />
  );
}
