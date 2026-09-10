import { prisma } from "@/lib/prisma";

/** Top-level, published categories for main navigation — fully DB-driven. */
export async function getNavCategories() {
  return prisma.category.findMany({
    where: { parentId: null, isPublished: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true, imageUrl: true },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      children: {
        where: { isPublished: true, deletedAt: null },
        orderBy: { displayOrder: "asc" },
      },
      parent: true,
    },
  });
}

/** All descendant category ids (self included) — used to scope product queries to a whole tree. */
export async function getCategoryTreeIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId, deletedAt: null },
    select: { id: true },
  });

  const nested = await Promise.all(children.map((c) => getCategoryTreeIds(c.id)));
  return [categoryId, ...nested.flat()];
}

/** Published categories only — for customer-facing filter UIs (e.g. the shop page sidebar). */
export async function getPublishedCategoriesFlat() {
  return prisma.category.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ parentId: "asc" }, { displayOrder: "asc" }],
  });
}
