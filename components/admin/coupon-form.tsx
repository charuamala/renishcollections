"use client";

import { useActionState, useEffect } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCouponAction, updateCouponAction, type CouponFormState } from "@/actions/admin/coupon.actions";
import type { Coupon } from "@prisma/client";

const initialState: CouponFormState = {};

/** Coupon with Decimal fields serialized to strings — Decimal instances can't cross the server/client boundary as props. */
export type SerializedCoupon = Omit<Coupon, "discountValue" | "minOrderAmount" | "maxDiscountAmount"> & {
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
};

function toDateInput(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function CouponForm({ coupon, onSaved }: { coupon?: SerializedCoupon; onSaved?: () => void }) {
  const action = coupon ? updateCouponAction.bind(null, coupon.id) : createCouponAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSaved?.();
  }, [state.success, onSaved]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="code">Coupon Code</Label>
        <Input id="code" name="code" defaultValue={coupon?.code} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={coupon?.description ?? ""} />
      </div>

      <div>
        <Label htmlFor="discountType">Discount Type</Label>
        <select
          id="discountType"
          name="discountType"
          defaultValue={coupon?.discountType ?? "PERCENTAGE"}
          className="h-11 w-full rounded-sm border border-border bg-white px-3 text-sm"
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed Amount</option>
        </select>
      </div>
      <div>
        <Label htmlFor="discountValue">Discount Value</Label>
        <Input id="discountValue" name="discountValue" type="number" step="0.01" defaultValue={coupon?.discountValue} required />
      </div>

      <div>
        <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
        <Input id="minOrderAmount" name="minOrderAmount" type="number" step="0.01" defaultValue={coupon?.minOrderAmount ?? ""} />
      </div>
      <div>
        <Label htmlFor="maxDiscountAmount">Maximum Discount Amount</Label>
        <Input id="maxDiscountAmount" name="maxDiscountAmount" type="number" step="0.01" defaultValue={coupon?.maxDiscountAmount ?? ""} />
      </div>

      <div>
        <Label htmlFor="startsAt">Start Date</Label>
        <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInput(coupon?.startsAt)} required />
      </div>
      <div>
        <Label htmlFor="endsAt">End Date</Label>
        <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInput(coupon?.endsAt)} required />
      </div>

      <div>
        <Label htmlFor="usageLimit">Total Usage Limit</Label>
        <Input id="usageLimit" name="usageLimit" type="number" defaultValue={coupon?.usageLimit ?? ""} />
      </div>
      <div>
        <Label htmlFor="perUserLimit">Per-User Usage Limit</Label>
        <Input id="perUserLimit" name="perUserLimit" type="number" defaultValue={coupon?.perUserLimit ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
        <input type="checkbox" name="isActive" defaultChecked={coupon?.isActive ?? true} className="h-4 w-4" />
        Active
      </label>

      {state.error && <p className="text-sm text-error sm:col-span-2">{state.error}</p>}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}
