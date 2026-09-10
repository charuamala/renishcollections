"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductStatusAction,
} from "@/actions/admin/product.actions";

interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  sellingPrice: string;
  stock: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  category: { name: string };
  images: { url: string }[];
}

export function ProductList({ products }: { products: AdminProductRow[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProductAction(id);
    });
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-400">
          <tr>
            <th className="p-3">Product</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="flex items-center gap-3 p-3">
                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-cream">
                  {product.images[0] && <Image src={product.images[0].url} alt="" fill sizes="40px" className="object-cover" />}
                </div>
                <div>
                  <p className="font-medium text-charcoal">{product.name}</p>
                  <p className="text-xs text-ink-400">{product.sku}</p>
                </div>
              </td>
              <td className="p-3 text-ink-600">{product.category.name}</td>
              <td className="p-3 text-charcoal">{formatPrice(product.sellingPrice)}</td>
              <td className="p-3">
                <span className={product.stock === 0 ? "text-error" : product.stock <= 5 ? "text-gold-600" : "text-charcoal"}>
                  {product.stock}
                </span>
              </td>
              <td className="p-3">
                <select
                  defaultValue={product.status}
                  disabled={isPending}
                  onChange={(e) =>
                    startTransition(() =>
                      toggleProductStatusAction(product.id, e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED"),
                    )
                  }
                  className="rounded-sm border border-border bg-white px-2 py-1 text-xs"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/products/${product.id}`} aria-label="Edit">
                    <Pencil className="h-4 w-4 text-ink-600 hover:text-maroon-600" />
                  </Link>
                  <button
                    type="button"
                    aria-label="Duplicate"
                    disabled={isPending}
                    onClick={() => startTransition(async () => { await duplicateProductAction(product.id); })}
                  >
                    <Copy className="h-4 w-4 text-ink-600 hover:text-maroon-600" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    disabled={isPending}
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4 text-ink-600 hover:text-error" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <p className="p-6 text-center text-sm text-ink-600">No products found.</p>}
    </div>
  );
}
