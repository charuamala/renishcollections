import { getShopProducts, type SortOption } from "@/services/product.service";
import { ProductCard } from "@/components/products/product-card";
import { CategoryGrid } from "@/components/home/category-grid";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";

const SORT_VALUES: SortOption[] = ["newest", "price_asc", "price_desc", "popular", "best_selling"];

export async function CategoryListing({
  categorySlug,
  title,
  description,
  subcategories,
  basePath,
  sortParam,
  pageParam,
  wishlistedIds,
}: {
  categorySlug: string;
  title: string;
  description?: string | null;
  subcategories: { name: string; slug: string; imageUrl: string | null }[];
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
      <h1 className="font-display text-3xl font-semibold text-charcoal">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-ink-600">{description}</p>}

      {subcategories.length > 0 && <CategoryGrid categories={subcategories} />}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-600">{total} products</p>
        <SortSelect current={sort} />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-600">No products found in this category yet.</p>
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
