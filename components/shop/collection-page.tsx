import { auth } from "@/auth";
import { getShopProducts, type ProductCollection, type SortOption } from "@/services/product.service";
import { getWishlistProductIdsForUser } from "@/services/wishlist.service";
import { ProductCard } from "@/components/products/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const SORT_VALUES: SortOption[] = ["newest", "price_asc", "price_desc", "popular", "best_selling"];

/** Listing page for a curated collection (New Arrivals, Best Sellers, Offers). */
export async function CollectionPage({
  collection,
  title,
  description,
  basePath,
  defaultSort = "newest",
  emptyTitle,
  emptyText,
  sortParam,
  pageParam,
}: {
  collection: ProductCollection;
  title: string;
  description: string;
  basePath: string;
  defaultSort?: SortOption;
  emptyTitle: string;
  emptyText: string;
  sortParam?: string;
  pageParam?: string;
}) {
  const sort: SortOption = SORT_VALUES.includes(sortParam as SortOption) ? (sortParam as SortOption) : defaultSort;
  const page = Math.max(1, Number(pageParam) || 1);
  const session = await auth();

  const [{ products, total, pageSize }, wishlistedIds] = await Promise.all([
    getShopProducts({ collection, sort, page }),
    session?.user?.id ? getWishlistProductIdsForUser(session.user.id) : Promise.resolve([] as string[]),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // An empty collection still gives the shopper somewhere to go: the latest sarees.
  const fallback = total === 0 ? (await getShopProducts({ sort: "newest", pageSize: 8 })).products : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { name: "Home", href: "/" },
          { name: title, href: basePath },
        ]}
      />
      <h1 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{description}</p>

      {products.length > 0 ? (
        <>
          <div className="mt-8 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-600">
              {total} {total === 1 ? "saree" : "sarees"}
            </p>
            <SortSelect current={sort} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isWishlisted={wishlistedIds.includes(product.id)} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath={basePath} searchParams={new URLSearchParams({ sort })} />
        </>
      ) : (
        <>
          <div className="mx-auto max-w-md py-14 text-center">
            <p className="font-display text-2xl font-semibold text-charcoal">{emptyTitle}</p>
            <p className="mt-2 text-sm text-ink-600">{emptyText}</p>
            <Button href="/sarees" variant="secondary" className="mt-6">
              Browse all sarees
            </Button>
          </div>
          {fallback.length > 0 && (
            <section className="border-t border-border pt-10">
              <h2 className="font-display text-2xl font-semibold text-charcoal">Our latest sarees</h2>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                {fallback.map((product) => (
                  <ProductCard key={product.id} product={product} isWishlisted={wishlistedIds.includes(product.id)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
