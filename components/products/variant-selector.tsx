"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { BuyNowButton } from "@/components/products/buy-now-button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  attributes: Record<string, string>;
  price: string | number;
  stock: number;
  isAvailable: boolean;
}

export function VariantSelector({
  productId,
  variants,
  fallbackPrice,
  fallbackStock,
}: {
  productId: string;
  variants: Variant[];
  fallbackPrice: string | number;
  fallbackStock: number;
}) {
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => Object.keys(v.attributes ?? {}).forEach((k) => keys.add(k)));
    return [...keys];
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>({});

  const matchedVariant = useMemo(() => {
    if (attributeKeys.length === 0) return null;
    if (Object.keys(selected).length !== attributeKeys.length) return null;
    return (
      variants.find((v) => attributeKeys.every((key) => v.attributes[key] === selected[key])) ?? null
    );
  }, [variants, attributeKeys, selected]);

  const allSelected = attributeKeys.length === 0 || Object.keys(selected).length === attributeKeys.length;
  const price = matchedVariant?.price ?? fallbackPrice;
  const stock = matchedVariant?.stock ?? fallbackStock;
  const disabled = attributeKeys.length > 0 ? !matchedVariant || !matchedVariant.isAvailable || stock <= 0 : stock <= 0;

  return (
    <div className="flex flex-col gap-4">
      {attributeKeys.map((key) => {
        const values = [...new Set(variants.map((v) => v.attributes[key]).filter(Boolean))];
        return (
          <div key={key}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-600">{key}</p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelected((prev) => ({ ...prev, [key]: value }))}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 text-sm",
                    selected[key] === value ? "border-maroon-600 bg-maroon-50 text-maroon-700" : "border-border text-charcoal",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-lg font-semibold text-charcoal">{formatPrice(price)}</p>
      {attributeKeys.length > 0 && !allSelected && (
        <p className="text-xs text-ink-400">Select {attributeKeys.join(" and ")} to see availability.</p>
      )}

      <div className="flex gap-3">
        <AddToCartButton productId={productId} variantId={matchedVariant?.id ?? null} disabled={disabled} fullWidth />
      </div>
      <BuyNowButton productId={productId} variantId={matchedVariant?.id ?? null} disabled={disabled} />
    </div>
  );
}
