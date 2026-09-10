import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/products/wishlist-button";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { formatPrice, discountPercentage } from "@/lib/utils";
import { productHref } from "@/lib/product-url";
import type { PublicProduct } from "@/services/product.service";

export function ProductCard({
  product,
  isWishlisted = false,
}: {
  product: Pick<
    PublicProduct,
    "id" | "name" | "slug" | "sellingPrice" | "originalPrice" | "stock" | "isNewArrival" | "isBestSeller" | "images" | "category"
  >;
  isWishlisted?: boolean;
}) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const discount = discountPercentage(product.originalPrice, product.sellingPrice);
  const inStock = product.stock > 0;
  const href = productHref(product);

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-cream">
        <Link href={href} className="relative block h-full w-full">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-400 text-sm">No image</div>
          )}
        </Link>

        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.isNewArrival && <Badge variant="gold">New</Badge>}
          {product.isBestSeller && <Badge variant="maroon">Bestseller</Badge>}
          {discount > 0 && <Badge variant="outline" className="bg-white">-{discount}%</Badge>}
        </div>

        <WishlistButton productId={product.id} initialWishlisted={isWishlisted} className="absolute right-2 top-2" />

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Badge variant="error">Out of Stock</Badge>
          </div>
        )}

        <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
          <AddToCartButton productId={product.id} disabled={!inStock} fullWidth size="sm" />
        </div>
      </div>

      <Link href={href} className="mt-3">
        <p className="text-xs uppercase tracking-wide text-ink-400">{product.category.name}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-medium text-charcoal">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal">{formatPrice(product.sellingPrice)}</span>
          {discount > 0 && (
            <span className="text-xs text-ink-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
