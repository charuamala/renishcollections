import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import type { PublicProduct } from "@/services/product.service";

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  wishlistedIds = [],
}: {
  title: string;
  subtitle?: string;
  products: PublicProduct[];
  viewAllHref?: string;
  wishlistedIds?: string[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-maroon-600 hover:underline">
            View All →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} isWishlisted={wishlistedIds.includes(product.id)} />
        ))}
      </div>
    </section>
  );
}
