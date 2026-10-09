import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategoryTreeIds } from "@/services/category.service";

/**
 * Field selection for every customer-facing query. `wholesalePrice` is
 * deliberately excluded here — it must never reach the browser. Admin
 * queries use a separate, explicit select (see admin product service).
 */
export const PUBLIC_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  shortDescription: true,
  description: true,
  sellingPrice: true,
  originalPrice: true,
  stock: true,
  fabric: true,
  color: true,
  sareeLength: true,
  blouseIncluded: true,
  careInstructions: true,
  tags: true,
  status: true,
  isFeatured: true,
  isNewArrival: true,
  isBestSeller: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  canonicalUrl: true,
  ogImageUrl: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true, parent: { select: { slug: true } } } },
  images: {
    orderBy: { displayOrder: "asc" as const },
    select: { id: true, url: true, altText: true, isPrimary: true, variantId: true },
  },
  videos: { select: { id: true, url: true, thumbnailUrl: true } },
  variants: {
    select: {
      id: true,
      sku: true,
      attributes: true,
      price: true,
      originalPrice: true,
      stock: true,
      isAvailable: true,
      images: { select: { id: true, url: true, altText: true } },
    },
  },
} satisfies Prisma.ProductSelect;

export type SortOption = "newest" | "price_asc" | "price_desc" | "popular" | "best_selling";

/** Curated storefront collections backed by product flags / pricing. */
export type ProductCollection = "new-arrivals" | "best-sellers" | "offers";

export interface ShopFilters {
  categorySlug?: string;
  collection?: ProductCollection;
  search?: string;
  subcategoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  fabrics?: string[];
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

function sortToOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { sellingPrice: "asc" };
    case "price_desc":
      return { sellingPrice: "desc" };
    case "best_selling":
      return { isBestSeller: "desc" };
    case "popular":
      return { reviews: { _count: "desc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

/** JSON string filters are case-sensitive, so try the common casings of a search term. */
function variantColourMatches(term: string) {
  const lower = term.toLowerCase();
  const title = lower.replace(/\b\w/g, (c) => c.toUpperCase());
  return [...new Set([term, lower, title])];
}

export async function getShopProducts(filters: ShopFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, filters.pageSize ?? 24));

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  if (filters.categorySlug) {
    const category = await prisma.category.findFirst({ where: { slug: filters.categorySlug } });
    if (!category) return { products: [], total: 0, page, pageSize };
    const categoryIds = await getCategoryTreeIds(category.id);
    where.categoryId = { in: categoryIds };
  }

  if (filters.subcategoryIds?.length) {
    where.categoryId = { in: filters.subcategoryIds };
  }

  if (filters.collection === "new-arrivals") where.isNewArrival = true;
  if (filters.collection === "best-sellers") where.isBestSeller = true;
  // A product is on offer when its original price is higher than what it sells for.
  if (filters.collection === "offers") where.originalPrice = { gt: prisma.product.fields.sellingPrice };

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { tags: { has: term.toLowerCase() } },
      { fabric: { contains: term, mode: "insensitive" } },
      { color: { contains: term, mode: "insensitive" } },
      { category: { name: { contains: term, mode: "insensitive" } } },
      // Colour options live on variants, e.g. "Purple & Grey".
      ...variantColourMatches(term).map((value) => ({
        variants: { some: { attributes: { path: ["color"], string_contains: value } } },
      })),
    ];
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.sellingPrice = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.colors?.length) {
    where.color = { in: filters.colors, mode: "insensitive" };
  }

  if (filters.fabrics?.length) {
    where.fabric = { in: filters.fabrics, mode: "insensitive" };
  }

  if (filters.inStockOnly) {
    where.stock = { gt: 0 };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: PUBLIC_PRODUCT_SELECT,
      orderBy: sortToOrderBy(filters.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: PUBLIC_PRODUCT_SELECT,
  });
}

/** Resolves a 301-redirect target for a slug that has since changed. */
export async function findRedirectTarget(oldSlug: string) {
  const redirect = await prisma.productSlugRedirect.findUnique({
    where: { oldSlug },
    include: { product: { select: { slug: true } } },
  });
  return redirect?.product.slug ?? null;
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, isFeatured: true },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getNewArrivals(take = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, isNewArrival: true },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getBestSellers(take = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, isBestSeller: true },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, take = 8) {
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      categoryId,
      id: { not: productId },
    },
    select: PUBLIC_PRODUCT_SELECT,
    take,
  });
}

export async function searchProducts(query: string, take = 20) {
  if (!query.trim()) return [];
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { fabric: { contains: query, mode: "insensitive" } },
        { color: { contains: query, mode: "insensitive" } },
        { tags: { has: query.toLowerCase() } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    select: PUBLIC_PRODUCT_SELECT,
    take,
  });
}

export type PublicProduct = Prisma.ProductGetPayload<{ select: typeof PUBLIC_PRODUCT_SELECT }>;

export async function getDistinctColors() {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, color: { not: null } },
    select: { color: true },
    distinct: ["color"],
  });
  return rows.map((r) => r.color).filter((c): c is string => !!c).sort();
}

export async function getDistinctFabrics() {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, fabric: { not: null } },
    select: { fabric: true },
    distinct: ["fabric"],
  });
  return rows.map((r) => r.fabric).filter((f): f is string => !!f).sort();
}
