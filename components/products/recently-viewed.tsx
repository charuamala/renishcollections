"use client";

import { useEffect, useState } from "react";
import { getProductsBySlugsAction } from "@/actions/product-view.actions";
import { ProductCard } from "@/components/products/product-card";
import type { PublicProduct } from "@/services/product.service";

const STORAGE_KEY = "rc_recently_viewed";
const MAX_ITEMS = 10;

/** Records the current product as viewed (call once on a product page). */
export function useRecordRecentlyViewed(slug: string) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const slugs: string[] = raw ? JSON.parse(raw) : [];
      const next = [slug, ...slugs.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode, blocked) — recently-viewed is a soft feature
    }
  }, [slug]);
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug: string }) {
  const [products, setProducts] = useState<PublicProduct[] | null>(null);

  useEffect(() => {
    let slugs: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      slugs = raw ? JSON.parse(raw) : [];
    } catch {
      slugs = [];
    }
    getProductsBySlugsAction({ slugs: slugs.filter((s) => s !== excludeSlug) }).then(setProducts);
  }, [excludeSlug]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-semibold text-charcoal">Recently Viewed</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
