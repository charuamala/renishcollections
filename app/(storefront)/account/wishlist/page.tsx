import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/authorization";
import { getWishlistProductsForUser } from "@/services/wishlist.service";
import { WishlistItemCard } from "@/components/account/wishlist-item-card";

export const metadata: Metadata = {
  title: "My Wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const user = await requireUserOrRedirect("/account/wishlist");
  const products = await getWishlistProductsForUser(user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-charcoal">My Wishlist</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-ink-600">Your wishlist is empty. Tap the heart on any product to save it here.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <WishlistItemCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                href: product.href,
                sellingPrice: product.sellingPrice.toString(),
                originalPrice: product.originalPrice.toString(),
                stock: product.stock,
                hasVariants: product.hasVariants,
                image: product.images.at(0) ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
