import Image from "next/image";
import { getShopProducts, type SortOption } from "@/services/product.service";
import type { CategoryCardData } from "@/services/category.service";
import { ProductCard } from "@/components/products/product-card";
import { CategoryGrid } from "@/components/home/category-grid";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const SORT_VALUES: SortOption[] = ["newest", "price_asc", "price_desc", "popular", "best_selling"];

export async function CategoryListing({
  categorySlug,
  title,
  description,
  subcategories,
  breadcrumbs,
  bannerImages = [],
  basePath,
  sortParam,
  pageParam,
  wishlistedIds,
}: {
  categorySlug: string;
  title: string;
  description?: string | null;
  subcategories: CategoryCardData[];
  breadcrumbs: { name: string; href: string }[];
  /** Category photos shown beside the heading (leaf categories). */
  bannerImages?: string[];
  basePath: string;
  sortParam?: string;
  pageParam?: string;
  wishlistedIds: string[];
}) {
  const sort: SortOption = SORT_VALUES.includes(sortParam as SortOption) ? (sortParam as SortOption) : "newest";
  const page = Math.max(1, Number(pageParam) || 1);

  const { products, total, pageSize } = await getShopProducts({ categorySlug, sort, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const urlSearchParams = new URLSearchParams({ sort });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} />

      <div className={bannerImages.length > 0 ? "mt-6 grid gap-8 lg:grid-cols-12 lg:items-end" : "mt-4"}>
        <div className="lg:col-span-5">
          <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{description}</p>}
        </div>
        {bannerImages.length > 0 && (
          <ul
            aria-label={`${title} photos`}
            className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:col-span-7 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0"
          >
            {bannerImages.map((src, index) => (
              <li
                key={src}
                className={`relative aspect-[3/4] w-[38vw] shrink-0 snap-start overflow-hidden rounded-card bg-cream sm:w-[26vw] lg:w-auto ${index >= 4 ? "lg:hidden" : ""}`}
              >
                <Image
                  src={src}
                  alt={`${title}, photo ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 14vw, 38vw"
                  className="object-cover"
                  loading={index < 2 ? "eager" : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {subcategories.length > 0 && <CategoryGrid categories={subcategories} title="Browse by category" embedded />}

      {products.length > 0 && (
        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-600">
            {total} {total === 1 ? "saree" : "sarees"}
          </p>
          <SortSelect current={sort} />
        </div>
      )}

      {products.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="font-display text-2xl font-semibold text-charcoal">New sarees are on their way</p>
          <p className="mt-2 text-sm text-ink-600">We&apos;re adding pieces to {title} right now. Please check back soon.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isWishlisted={wishlistedIds.includes(product.id)} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={basePath} searchParams={urlSearchParams} />
    </div>
  );
}
