"use client";

import { useActionState, useEffect } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAddressAction, updateAddressAction, type AddressFormState } from "@/actions/address.actions";
import type { Address } from "@prisma/client";

const initialState: AddressFormState = {};

export function AddressForm({ address, onSaved }: { address?: Address; onSaved?: () => void }) {
  const action = address ? updateAddressAction.bind(null, address.id) : createAddressAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSaved?.();
  }, [state.success, onSaved]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" defaultValue={address?.fullName} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={address?.phone} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="line1">Address Line 1</Label>
        <Input id="line1" name="line1" defaultValue={address?.line1} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="line2">Address Line 2 (optional)</Label>
        <Input id="line2" name="line2" defaultValue={address?.line2 ?? ""} />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" defaultValue={address?.city} required />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" defaultValue={address?.state} required />
      </div>
      <div>
        <Label htmlFor="pincode">Pincode</Label>
        <Input id="pincode" name="pincode" defaultValue={address?.pincode} required />
      </div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink-600">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="h-4 w-4" />
        Set as default address
      </label>
      {state.error && <p className="text-sm text-error sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : address ? "Update Address" : "Add Address"}
        </Button>
      </div>
    </form>
  );
}
