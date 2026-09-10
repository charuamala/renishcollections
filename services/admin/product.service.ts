import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugifyText } from "@/lib/utils";
import type { ProductAdminInput } from "@/schemas/admin/product.schema";

/** Full field set for the admin panel — includes wholesalePrice, unlike the public select. */
export const ADMIN_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  categoryId: true,
  category: { select: { id: true, name: true } },
  shortDescription: true,
  description: true,
  sellingPrice: true,
  originalPrice: true,
  wholesalePrice: true,
  stock: true,
  lowStockThreshold: true,
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
  images: { orderBy: { displayOrder: "asc" as const } },
  videos: true,
  variants: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export interface AdminProductFilters {
  search?: string;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  page?: number;
  pageSize?: number;
}

export async function listProductsForAdmin(filters: AdminProductFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));

  const where: Prisma.ProductWhereInput = { deletedAt: null };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        sellingPrice: true,
        stock: true,
        status: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        category: { select: { name: true } },
        images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize };
}

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({ where: { id }, select: ADMIN_PRODUCT_SELECT });
}

async function resolveUniqueProductSlug(name: string, desiredSlug: string | undefined, excludeId?: string) {
  const base = desiredSlug || slugifyText(name);
  let slug = base;
  let suffix = 1;
  while (await prisma.product.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    slug = `${base}-${++suffix}`;
  }
  return slug;
}

async function assertSkuAvailable(sku: string, excludeId?: string) {
  const existing = await prisma.product.findFirst({
    where: { sku, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`SKU "${sku}" is already used by another product`);
  }
}

function parseTags(tags: string | undefined) {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function variantAttributes(variant: { color?: string; size?: string }) {
  const attrs: Record<string, string> = {};
  if (variant.color) attrs.color = variant.color;
  if (variant.size) attrs.size = variant.size;
  return attrs;
}

export async function createProductAdmin(input: ProductAdminInput) {
  await assertSkuAvailable(input.sku);
  const slug = await resolveUniqueProductSlug(input.name, input.slug || undefined);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        slug,
        sku: input.sku,
        categoryId: input.categoryId,
        shortDescription: input.shortDescription || null,
        description: input.description || null,
        sellingPrice: input.sellingPrice,
        originalPrice: input.originalPrice,
        wholesalePrice: input.wholesalePrice ?? null,
        stock: input.stock,
        lowStockThreshold: input.lowStockThreshold,
        fabric: input.fabric || null,
        color: input.color || null,
        sareeLength: input.sareeLength || null,
        blouseIncluded: input.blouseIncluded,
        careInstructions: input.careInstructions || null,
        tags: parseTags(input.tags),
        status: input.status,
        isFeatured: input.isFeatured,
        isNewArrival: input.isNewArrival,
        isBestSeller: input.isBestSeller,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        seoKeywords: input.seoKeywords || null,
        canonicalUrl: input.canonicalUrl || null,
        ogImageUrl: input.ogImageUrl || null,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    });

    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: input.images.map((url, index) => ({
          productId: product.id,
          url,
          displayOrder: index,
          isPrimary: index === 0,
        })),
      });
    }

    if (input.videoUrl) {
      await tx.productVideo.create({ data: { productId: product.id, url: input.videoUrl } });
    }

    if (input.variants.length > 0) {
      await tx.productVariant.createMany({
        data: input.variants.map((v) => ({
          productId: product.id,
          sku: v.sku,
          attributes: variantAttributes(v),
          price: v.price,
          stock: v.stock,
        })),
      });
    }

    return product;
  });
}

export async function updateProductAdmin(id: string, input: ProductAdminInput) {
  await assertSkuAvailable(input.sku, id);
  const slug = await resolveUniqueProductSlug(input.name, input.slug || undefined, id);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUniqueOrThrow({ where: { id }, select: { slug: true, status: true, publishedAt: true } });

    if (existing.slug !== slug) {
      await tx.productSlugRedirect.upsert({
        where: { oldSlug: existing.slug },
        update: { productId: id },
        create: { oldSlug: existing.slug, productId: id },
      });
    }

    const product = await tx.product.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        sku: input.sku,
        categoryId: input.categoryId,
        shortDescription: input.shortDescription || null,
        description: input.description || null,
        sellingPrice: input.sellingPrice,
        originalPrice: input.originalPrice,
        wholesalePrice: input.wholesalePrice ?? null,
        stock: input.stock,
        lowStockThreshold: input.lowStockThreshold,
        fabric: input.fabric || null,
        color: input.color || null,
        sareeLength: input.sareeLength || null,
        blouseIncluded: input.blouseIncluded,
        careInstructions: input.careInstructions || null,
        tags: parseTags(input.tags),
        status: input.status,
        isFeatured: input.isFeatured,
        isNewArrival: input.isNewArrival,
        isBestSeller: input.isBestSeller,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        seoKeywords: input.seoKeywords || null,
        canonicalUrl: input.canonicalUrl || null,
        ogImageUrl: input.ogImageUrl || null,
        publishedAt: input.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
    });

    // Images and variants are fully replaced on each save — simpler and
    // safer than diffing, and the admin editor always submits the full set.
    await tx.productImage.deleteMany({ where: { productId: id } });
    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: input.images.map((url, index) => ({
          productId: id,
          url,
          displayOrder: index,
          isPrimary: index === 0,
        })),
      });
    }

    await tx.productVideo.deleteMany({ where: { productId: id } });
    if (input.videoUrl) {
      await tx.productVideo.create({ data: { productId: id, url: input.videoUrl } });
    }

    await tx.productVariant.deleteMany({ where: { productId: id } });
    if (input.variants.length > 0) {
      await tx.productVariant.createMany({
        data: input.variants.map((v) => ({
          productId: id,
          sku: v.sku,
          attributes: variantAttributes(v),
          price: v.price,
          stock: v.stock,
        })),
      });
    }

    return product;
  });
}

export async function deleteProductAdmin(id: string) {
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
}

export async function duplicateProductAdmin(id: string) {
  const original = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: { images: true, variants: true },
  });

  const baseSlug = `${original.slug}-copy`;
  const slug = await resolveUniqueProductSlug(original.name, baseSlug);
  const sku = `${original.sku}-COPY-${Date.now().toString().slice(-5)}`;

  return prisma.$transaction(async (tx) => {
    const copy = await tx.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug,
        sku,
        categoryId: original.categoryId,
        shortDescription: original.shortDescription,
        description: original.description,
        sellingPrice: original.sellingPrice,
        originalPrice: original.originalPrice,
        wholesalePrice: original.wholesalePrice,
        stock: original.stock,
        lowStockThreshold: original.lowStockThreshold,
        fabric: original.fabric,
        color: original.color,
        sareeLength: original.sareeLength,
        blouseIncluded: original.blouseIncluded,
        careInstructions: original.careInstructions,
        tags: original.tags,
        status: "DRAFT",
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        seoKeywords: original.seoKeywords,
      },
    });

    if (original.images.length > 0) {
      await tx.productImage.createMany({
        data: original.images.map((img) => ({
          productId: copy.id,
          url: img.url,
          altText: img.altText,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
        })),
      });
    }

    if (original.variants.length > 0) {
      await tx.productVariant.createMany({
        data: original.variants.map((v, i) => ({
          productId: copy.id,
          sku: `${v.sku}-COPY-${i}`,
          attributes: v.attributes as Prisma.InputJsonValue,
          price: v.price,
          stock: v.stock,
        })),
      });
    }

    return copy;
  });
}

export async function toggleProductField(
  id: string,
  field: "isFeatured" | "isNewArrival" | "isBestSeller",
  value: boolean,
) {
  return prisma.product.update({ where: { id }, data: { [field]: value } });
}

export async function toggleProductStatus(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  return prisma.product.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : undefined },
  });
}
