/** Canonical product URL is always /<top-level-category-slug>/<product-slug>. */
export function productHref(product: { slug: string; category: { slug: string; parent?: { slug: string } | null } }) {
  const rootSlug = product.category.parent?.slug ?? product.category.slug;
  return `/${rootSlug}/${product.slug}`;
}
