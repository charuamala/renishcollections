import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listProductsForAdmin } from "@/services/admin/product.service";
import { Button } from "@/components/ui/button";
import { ProductList } from "@/components/admin/product-list";
import { Pagination } from "@/components/shop/pagination";

export const metadata: Metadata = {
  title: "Manage Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const { products, total, pageSize } = await listProductsForAdmin({ search, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Products</h1>
        <Button href="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <form method="get" className="mt-4">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by name or SKU..."
          className="h-10 w-full max-w-sm rounded-sm border border-border px-3 text-sm"
        />
      </form>

      <div className="mt-4">
        <ProductList
          products={products.map((p) => ({
            ...p,
            sellingPrice: p.sellingPrice.toString(),
          }))}
        />
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/admin/products" searchParams={new URLSearchParams(search ? { q: search } : {})} />

      <p className="mt-4 text-xs text-ink-400">
        <Link href="/admin/categories" className="hover:underline">
          Manage categories
        </Link>{" "}
        if the category you need isn&apos;t listed yet.
      </p>
    </div>
  );
}
