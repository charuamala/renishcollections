import { SITE_URL } from "@/lib/constants";

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description?: string | null;
  sku: string;
  images: { url: string }[];
  sellingPrice: number | string;
  stock: number;
  href: string;
  category: { name: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku,
    image: product.images.map((img) => img.url),
    category: product.category.name,
    brand: { "@type": "Brand", name: "Renish Collections" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${product.href}`,
      priceCurrency: "INR",
      price: Number(product.sellingPrice),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}
