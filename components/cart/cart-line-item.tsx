"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { updateCartItemAction, removeCartItemAction } from "@/actions/cart.actions";

export interface SerializedCartLine {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  href: string;
  image: { url: string; altText: string | null } | null;
  quantity: number;
  availableStock: number;
  isAvailable: boolean;
  lineTotal: string;
}

export function CartLineItem({ line }: { line: SerializedCartLine }) {
  const [isPending, startTransition] = useTransition();

  function updateQuantity(quantity: number) {
    startTransition(() => {
      updateCartItemAction({ cartItemId: line.id, productId: line.productId, variantId: line.variantId, quantity });
    });
  }

  function remove() {
    startTransition(() => {
      removeCartItemAction({ cartItemId: line.id, productId: line.productId, variantId: line.variantId });
    });
  }

  return (
    <div className="flex gap-4 py-5 opacity-100 transition-opacity data-[pending=true]:opacity-50" data-pending={isPending}>
      <Link href={line.href} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-cream">
        {line.image && <Image src={line.image.url} alt={line.image.altText || line.name} fill sizes="80px" className="object-cover" />}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-3">
          <div>
            <Link href={line.href} className="text-sm font-medium text-charcoal hover:underline">
              {line.name}
            </Link>
            {!line.isAvailable && <p className="mt-1 text-xs text-error">Currently unavailable</p>}
          </div>
          <button type="button" onClick={remove} aria-label="Remove item" className="text-ink-400 hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-sm border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(line.quantity - 1)}
              disabled={isPending}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(line.quantity + 1)}
              disabled={isPending || line.quantity >= line.availableStock}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm font-semibold text-charcoal">{formatPrice(line.lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}
