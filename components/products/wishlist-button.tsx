"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/actions/wishlist.actions";

export function WishlistButton({
  productId,
  initialWishlisted = false,
  className,
}: {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [wishlisted, setOptimisticWishlisted] = useOptimistic(initialWishlisted);

  return (
    <button
      type="button"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          setOptimisticWishlisted(!wishlisted);
          await toggleWishlistAction({ productId });
        });
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={cn("h-4.5 w-4.5", wishlisted ? "fill-maroon-600 text-maroon-600" : "text-charcoal")}
        strokeWidth={1.75}
      />
    </button>
  );
}
