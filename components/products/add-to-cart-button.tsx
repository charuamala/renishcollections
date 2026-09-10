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
  size = "md",
  fullWidth,
  label = "Add to Cart",
}: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  disabled?: boolean;
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await addToCartAction({ productId, variantId, quantity });
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        });
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "Added" : disabled ? "Out of Stock" : label}
    </Button>
  );
}
