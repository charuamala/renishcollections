import type { Metadata } from "next";
import { auth } from "@/auth";
import {
  getShopProducts,
  getDistinctColors,
  getDistinctFabrics,
  type SortOption,
} from "@/services/product.service";
import { getPublishedCategoriesFlat } from "@/services/category.service";
import { getWishlistProductIdsForUser } from "@/services/wishlist.service";
import { ProductCard } from "@/components/products/product-card";
import { FilterPanel, type CurrentFilterParams } from "@/components/shop/filter-panel";
import { MobileFilterDrawer } from "@/components/shop/mobile-filter-drawer";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";

export const metadata: Metadata = {
  title: "Shop All Sarees",
  description: "Browse our full collection of silk, cotton, designer and wedding sarees.",
  robots: { index: true, follow: true },
};

const SORT_VALUES: SortOption[] = ["newest", "price_asc", "price_desc", "popular", "best_selling"];

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const session = await auth();

  const categoryIds = toArray(params.category);
  const colors = toArray(params.color);
  const fabrics = toArray(params.fabric);
  const search = firstValue(params.q);
  const minPrice = firstValue(params.minPrice);
  const maxPrice = firstValue(params.maxPrice);
  const inStockOnly = firstValue(params.inStock) === "1";
  const sortParam = firstValue(params.sort);
  const sort: SortOption = SORT_VALUES.includes(sortParam as SortOption) ? (sortParam as SortOption) : "newest";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);

  const [{ products, total, pageSize }, allCategories, availableColors, availableFabrics, wishlistedIds] =
    await Promise.all([
      getShopProducts({
        subcategoryIds: categoryIds.length ? categoryIds : undefined,
        search,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        colors: colors.length ? colors : undefined,
        fabrics: fabrics.length ? fabrics : undefined,
        inStockOnly,
        sort,
        page,
      }),
      getPublishedCategoriesFlat(),
      getDistinctColors(),
      getDistinctFabrics(),
      session?.user?.id ? getWishlistProductIdsForUser(session.user.id) : Promise.resolve([]),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentParams: CurrentFilterParams = {
    q: search,
    category: categoryIds,
    color: colors,
    fabric: fabrics,
    minPrice,
    maxPrice,
    inStock: inStockOnly ? "1" : undefined,
  };

  const urlSearchParams = new URLSearchParams();
  categoryIds.forEach((id) => urlSearchParams.append("category", id));
  colors.forEach((c) => urlSearchParams.append("color", c));
  fabrics.forEach((f) => urlSearchParams.append("fabric", f));
  if (search) urlSearchParams.set("q", search);
  if (minPrice) urlSearchParams.set("minPrice", minPrice);
  if (maxPrice) urlSearchParams.set("maxPrice", maxPrice);
  if (inStockOnly) urlSearchParams.set("inStock", "1");
  urlSearchParams.set("sort", sort);

  const filterPanel = (
    <FilterPanel
      categories={allCategories.map((c) => ({ id: c.id, name: c.name }))}
      colors={availableColors}
      fabrics={availableFabrics}
      currentParams={currentParams}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-charcoal">
        {search ? `Search results for "${search}"` : "Shop All Sarees"}
      </h1>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-600">{total} products</p>
        <div className="flex items-center gap-3">
          <MobileFilterDrawer>{filterPanel}</MobileFilterDrawer>
          <SortSelect current={sort} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div>
          {products.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-600">
              No products match your filters. Try adjusting or clearing them.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isWishlisted={wishlistedIds.includes(product.id)} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} basePath="/shop" searchParams={urlSearchParams} />
        </div>
      </div>
    </div>
  );
}
