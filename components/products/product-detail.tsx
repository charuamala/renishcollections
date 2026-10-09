import { Check, X } from "lucide-react";
import { ImageGallery } from "@/components/products/image-gallery";
import { VariantSelectionProvider } from "@/components/products/variant-selection";
import { VariantSelector } from "@/components/products/variant-selector";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { BuyNowButton } from "@/components/products/buy-now-button";
import { WishlistButton } from "@/components/products/wishlist-button";
import { ShareButton } from "@/components/products/share-button";
import { ProductFaq } from "@/components/products/product-faq";
import { RecordView } from "@/components/products/record-view";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { ReviewList } from "@/components/reviews/review-list";
import { ProductSection } from "@/components/home/product-section";
import { Badge } from "@/components/ui/badge";
import { formatPrice, discountPercentage } from "@/lib/utils";
import { productHref } from "@/lib/product-url";
import { SITE_URL } from "@/lib/constants";
import type { PublicProduct } from "@/services/product.service";

interface ProductDetailProps {
  product: PublicProduct;
  relatedProducts: PublicProduct[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    isVerifiedPurchase: boolean;
    createdAt: Date;
    user: { name: string | null };
  }[];
  ratingSummary: { average: number; count: number };
  isLoggedIn: boolean;
  isWishlisted: boolean;
  storeFacts: StoreFacts;
}

/** Owner-confirmed store facts from SiteSettings; anything unset is simply not shown. */
export interface StoreFacts {
  deliveryTime: string | null;
  returnPolicy: string | null;
  codAvailable: boolean;
  contactPhone: string | null;
  whatsappUrl: string | null;
}

const SPEC_ROWS: { label: string; key: keyof PublicProduct }[] = [
  { label: "Fabric", key: "fabric" },
  { label: "Color", key: "color" },
  { label: "Saree Length", key: "sareeLength" },
];

export function ProductDetail({
  product,
  relatedProducts,
  reviews,
  ratingSummary,
  isLoggedIn,
  isWishlisted,
  storeFacts,
}: ProductDetailProps) {
  const discount = discountPercentage(product.originalPrice, product.sellingPrice);
  const inStock = product.stock > 0;
  const hasVariants = product.variants.length > 0;

  const variantsForClient = product.variants.map((v) => ({
    id: v.id,
    attributes: (v.attributes ?? {}) as Record<string, string>,
    price: v.price.toString(),
    stock: v.stock,
    isAvailable: v.isAvailable,
    // First photo tagged with this variant — shown on its colour button.
    imageUrl: product.images.find((img) => img.variantId === v.id)?.url ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RecordView slug={product.slug} />

      <VariantSelectionProvider>
        <div className="grid gap-10 lg:grid-cols-2">
          <ImageGallery images={product.images} productName={product.name} />

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-ink-400">{product.category.name}</p>
            <h1 className="font-display mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-xs text-ink-400">SKU: {product.sku}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.isNewArrival && <Badge variant="gold">New Arrival</Badge>}
              {product.isBestSeller && <Badge variant="maroon">Bestseller</Badge>}
              <Badge variant={inStock ? "success" : "error"}>{inStock ? "In Stock" : "Out of Stock"}</Badge>
            </div>

            {!hasVariants && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-semibold text-charcoal">{formatPrice(product.sellingPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-base text-ink-400 line-through">{formatPrice(product.originalPrice)}</span>
                    <Badge variant="outline">-{discount}%</Badge>
                  </>
                )}
              </div>
            )}

            {product.shortDescription && <p className="mt-4 text-sm text-ink-600">{product.shortDescription}</p>}

            <div className="mt-6">
              {hasVariants ? (
                <VariantSelector
                  productId={product.id}
                  variants={variantsForClient}
                  fallbackPrice={product.sellingPrice.toString()}
                  fallbackStock={product.stock}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <AddToCartButton productId={product.id} disabled={!inStock} fullWidth />
                  <BuyNowButton productId={product.id} disabled={!inStock} />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <WishlistButton
                productId={product.id}
                initialWishlisted={isWishlisted}
                className="static h-auto w-auto bg-transparent shadow-none hover:bg-transparent"
              />
              <ShareButton title={product.name} url={`${SITE_URL}${productHref(product)}`} />
            </div>

            <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
              {SPEC_ROWS.filter((row) => product[row.key]).map((row) => (
                <div key={row.label} className="flex justify-between py-2.5">
                  <dt className="text-ink-600">{row.label}</dt>
                  <dd className="font-medium text-charcoal">{String(product[row.key])}</dd>
                </div>
              ))}
              <div className="flex justify-between py-2.5">
                <dt className="text-ink-600">Blouse Included</dt>
                <dd className="flex items-center gap-1 font-medium text-charcoal">
                  {product.blouseIncluded ? (
                    <>
                      <Check className="h-4 w-4 text-success" /> Yes
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-error" /> No
                    </>
                  )}
                </dd>
              </div>
            </dl>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-charcoal">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-600">{product.description}</p>
              </div>
            )}

            {product.careInstructions && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-charcoal">Care Instructions</h2>
                <p className="mt-2 text-sm text-ink-600">{product.careInstructions}</p>
              </div>
            )}

            {(storeFacts.deliveryTime || storeFacts.returnPolicy) && (
              <div className="mt-6 grid gap-4 rounded-sm bg-cream p-4 text-sm text-ink-600 sm:grid-cols-2">
                {storeFacts.deliveryTime && (
                  <div>
                    <p className="font-semibold text-charcoal">Delivery</p>
                    <p className="mt-1">
                      Delivered in {storeFacts.deliveryTime}.{!storeFacts.codAvailable && " Prepaid orders only."}
                    </p>
                  </div>
                )}
                {storeFacts.returnPolicy && (
                  <div>
                    <p className="font-semibold text-charcoal">Returns</p>
                    <p className="mt-1">{storeFacts.returnPolicy}</p>
                  </div>
                )}
              </div>
            )}
            {storeFacts.whatsappUrl && (
              <p className="mt-4 text-sm text-ink-600">
                Questions about this saree?{" "}
                <a
                  href={`${storeFacts.whatsappUrl}?text=${encodeURIComponent(`Hi Renish Collections, I have a question about ${product.name}: ${SITE_URL}${productHref(product)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-maroon-600 hover:underline"
                >
                  Chat with us on WhatsApp
                </a>
                {storeFacts.contactPhone && ` or call ${storeFacts.contactPhone}`}.
              </p>
            )}
          </div>
        </div>
      </VariantSelectionProvider>

      <ReviewList productId={product.id} reviews={reviews} summary={ratingSummary} isLoggedIn={isLoggedIn} />
      <ProductFaq
        deliveryTime={storeFacts.deliveryTime}
        returnPolicy={storeFacts.returnPolicy}
        blouseIncluded={product.blouseIncluded}
        careInstructions={product.careInstructions}
      />

      <ProductSection title="You May Also Like" products={relatedProducts} />
      <RecentlyViewed excludeSlug={product.slug} />
    </div>
  );
}
