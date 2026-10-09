"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/actions/cart.actions";

export function BuyNowButton({
  productId,
  variantId = null,
  disabled,
}: {
  productId: string;
  variantId?: string | null;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      fullWidth
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await addToCartAction({ productId, variantId, quantity: 1 });
          if (result.success) router.push("/cart");
        });
      }}
    >
      Buy Now
    </Button>
  );
}
