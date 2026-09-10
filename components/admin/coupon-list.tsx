"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CouponForm, type SerializedCoupon } from "@/components/admin/coupon-form";
import { deleteCouponAction, toggleCouponActiveAction } from "@/actions/admin/coupon.actions";
import { formatPrice } from "@/lib/utils";

export function CouponList({ coupons }: { coupons: SerializedCoupon[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Coupons</h1>
        <Button type="button" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {showAddForm && (
        <div className="mt-4 rounded-sm border border-border bg-white p-4">
          <CouponForm onSaved={() => setShowAddForm(false)} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {coupons.map((coupon) =>
          editingId === coupon.id ? (
            <div key={coupon.id} className="rounded-sm border border-border bg-white p-4">
              <CouponForm coupon={coupon} onSaved={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={coupon.id} className="flex items-center justify-between rounded-sm border border-border bg-white p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-charcoal">{coupon.code}</p>
                  <Badge variant={coupon.isActive ? "success" : "outline"}>{coupon.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-600">
                  {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% off` : `${formatPrice(coupon.discountValue)} off`}
                  {coupon.minOrderAmount ? ` · Min order ${formatPrice(coupon.minOrderAmount)}` : ""} · Valid{" "}
                  {coupon.startsAt.toLocaleDateString("en-IN")} – {coupon.endsAt.toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs text-ink-600 hover:text-maroon-600"
                  disabled={isPending}
                  onClick={() => startTransition(() => toggleCouponActiveAction(coupon.id, !coupon.isActive))}
                >
                  {coupon.isActive ? "Deactivate" : "Activate"}
                </button>
                <button type="button" aria-label="Edit" onClick={() => setEditingId(coupon.id)}>
                  <Pencil className="h-4 w-4 text-ink-600 hover:text-maroon-600" />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteCouponAction(coupon.id))}
                >
                  <Trash2 className="h-4 w-4 text-ink-600 hover:text-error" />
                </button>
              </div>
            </div>
          ),
        )}
        {coupons.length === 0 && <p className="text-sm text-ink-600">No coupons yet.</p>}
      </div>
    </div>
  );
}
