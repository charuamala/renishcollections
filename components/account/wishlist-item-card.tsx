"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { formatPrice, discountPercentage } from "@/lib/utils";
import { toggleWishlistAction, moveWishlistItemToCartAction } from "@/actions/wishlist.actions";
import { Button } from "@/components/ui/button";

interface WishlistProduct {
  id: string;
  name: string;
  href: string;
  sellingPrice: string;
  originalPrice: string;
  stock: number;
  image: { url: string; altText: string | null } | null;
}

export function WishlistItemCard({ product }: { product: WishlistProduct }) {
  const [isPending, startTransition] = useTransition();
  const discount = discountPercentage(product.originalPrice, product.sellingPrice);
  const inStock = product.stock > 0;

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-cream">
        <Link href={product.href} className="relative block h-full w-full">
          {product.image && (
            <Image src={product.image.url} alt={product.image.altText || product.name} fill sizes="25vw" className="object-cover" />
          )}
        </Link>
        <button
          type="button"
          aria-label="Remove from wishlist"
          disabled={isPending}
          onClick={() => startTransition(async () => { await toggleWishlistAction({ productId: product.id }); })}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Link href={product.href} className="mt-2 line-clamp-1 text-sm font-medium text-charcoal">
        {product.name}
      </Link>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className="font-semibold text-charcoal">{formatPrice(product.sellingPrice)}</span>
        {discount > 0 && <span className="text-ink-400 line-through">{formatPrice(product.originalPrice)}</span>}
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="mt-2"
        disabled={!inStock || isPending}
        onClick={() => startTransition(async () => { await moveWishlistItemToCartAction({ productId: product.id }); })}
      >
        {inStock ? "Move to Cart" : "Out of Stock"}
      </Button>
    </div>
  );
}
