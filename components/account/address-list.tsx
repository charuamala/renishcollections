"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddressForm } from "@/components/account/address-form";
import { deleteAddressAction } from "@/actions/address.actions";
import type { Address } from "@prisma/client";

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (addresses.length === 0) {
    return <p className="text-sm text-ink-600">You have no saved addresses yet.</p>;
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) =>
        editingId === address.id ? (
          <div key={address.id} className="rounded-sm border border-border bg-white p-4">
            <AddressForm address={address} onSaved={() => setEditingId(null)} />
          </div>
        ) : (
          <div key={address.id} className="flex items-start justify-between rounded-sm border border-border bg-white p-4">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium text-charcoal">{address.fullName}</p>
                {address.isDefault && <Badge variant="gold">Default</Badge>}
              </div>
              <p className="mt-1 text-ink-600">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="mt-1 text-ink-400">{address.phone}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Edit address" onClick={() => setEditingId(address.id)}>
                <Pencil className="h-4 w-4 text-ink-600 hover:text-maroon-600" />
              </button>
              <button
                type="button"
                aria-label="Delete address"
                disabled={isPending}
                onClick={() => startTransition(() => deleteAddressAction(address.id))}
              >
                <Trash2 className="h-4 w-4 text-ink-600 hover:text-error" />
              </button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
