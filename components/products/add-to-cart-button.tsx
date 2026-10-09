"use client";

import { useState, useTransition } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { addToCartAction } from "@/actions/cart.actions";

export function AddToCartButton({
  productId,
  variantId = null,
  quantity = 1,
  disabled,
  disabledLabel = "Out of Stock",
  size = "md",
  fullWidth,
  label = "Add to Cart",
}: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  disabled?: boolean;
  /** Shown while disabled, e.g. "Select color" before a variant is chosen. */
  disabledLabel?: string;
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = error ?? (added ? "Added" : disabled ? disabledLabel : label);

  return (
    <Button
      type="button"
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isPending}
      aria-live="polite"
      onClick={() => {
        startTransition(async () => {
          const result = await addToCartAction({ productId, variantId, quantity });
          if (!result.success) {
            setError(result.error);
            setTimeout(() => setError(null), 2500);
            return;
          }
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        });
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {text}
    </Button>
  );
}
