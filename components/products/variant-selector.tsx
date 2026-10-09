"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { BuyNowButton } from "@/components/products/buy-now-button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useVariantSelection } from "@/components/products/variant-selection";

interface Variant {
  id: string;
  attributes: Record<string, string>;
  price: string | number;
  stock: number;
  isAvailable: boolean;
  imageUrl?: string | null;
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
  const selection = useVariantSelection();

  // A colour picked by clicking a gallery photo selects the matching options here.
  const externalVariantId = selection?.variantId ?? null;
  const [syncedVariantId, setSyncedVariantId] = useState<string | null>(null);
  if (externalVariantId !== syncedVariantId) {
    setSyncedVariantId(externalVariantId);
    const external = variants.find((v) => v.id === externalVariantId);
    if (external) setSelected({ ...(external.attributes ?? {}) });
  }

  function choose(key: string, value: string) {
    const next = { ...selected, [key]: value };
    setSelected(next);
    // Tell the gallery which photos to show — the first variant matching everything chosen so far.
    const match = variants.find((v) => Object.entries(next).every(([k, val]) => v.attributes[k] === val));
    if (match && selection) {
      setSyncedVariantId(match.id);
      selection.setVariantId(match.id);
    }
  }

  const matchedVariant = useMemo(() => {
    if (attributeKeys.length === 0) return null;
    if (Object.keys(selected).length !== attributeKeys.length) return null;
    return variants.find((v) => attributeKeys.every((key) => v.attributes[key] === selected[key])) ?? null;
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
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-600">
              {key}
              {selected[key] && (
                <span className="ml-1.5 font-normal normal-case tracking-normal text-charcoal">{selected[key]}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                // Photo of the first variant with this option (e.g. the colour), when one is tagged.
                const imageUrl = variants.find((v) => v.attributes[key] === value && v.imageUrl)?.imageUrl;
                const isSelected = selected[key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => choose(key, value)}
                    className={cn(
                      "flex items-center gap-2 rounded-sm border text-sm",
                      imageUrl ? "py-1 pl-1 pr-3" : "px-3 py-1.5",
                      isSelected ? "border-maroon-600 bg-maroon-50 text-maroon-700" : "border-border text-charcoal",
                    )}
                  >
                    {imageUrl && (
                      <span className="relative h-9 w-7 shrink-0 overflow-hidden rounded-[2px] bg-cream">
                        <Image src={imageUrl} alt="" fill sizes="28px" className="object-cover" />
                      </span>
                    )}
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-lg font-semibold text-charcoal">{formatPrice(price)}</p>
      {attributeKeys.length > 0 && !allSelected && (
        <p className="text-xs text-ink-400">Select {attributeKeys.join(" and ")} to see availability.</p>
      )}

      <div className="flex gap-3">
        <AddToCartButton
          productId={productId}
          variantId={matchedVariant?.id ?? null}
          disabled={disabled}
          disabledLabel={allSelected ? "Out of Stock" : `Select ${attributeKeys.find((k) => !selected[k]) ?? "option"}`}
          fullWidth
        />
      </div>
      <BuyNowButton productId={productId} variantId={matchedVariant?.id ?? null} disabled={disabled} />
    </div>
  );
}
