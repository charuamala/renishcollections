"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/account/address-form";

export function AddNewAddress() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add New Address
      </Button>
    );
  }

  return (
    <div className="rounded-sm border border-border bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-charcoal">New Address</p>
      <AddressForm onSaved={() => setOpen(false)} />
    </div>
  );
}
