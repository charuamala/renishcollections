import "server-only";
import { prisma } from "@/lib/prisma";
import { slugifyText } from "@/lib/utils";
import type { CategoryAdminInput } from "@/schemas/admin/category.schema";

/** Flat list for select inputs (product editor, category parent picker). */
export async function listCategoriesForSelect() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ parentId: "asc" }, { displayOrder: "asc" }],
    select: { id: true, name: true, parent: { select: { name: true } } },
  });
  return categories.map((c) => ({ id: c.id, name: c.name, parentName: c.parent?.name ?? null }));
}

export async function listAllCategoriesForAdmin() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ parentId: "asc" }, { displayOrder: "asc" }],
    include: { parent: { select: { name: true } }, _count: { select: { products: true, children: true } } },
  });
}

async function resolveUniqueSlug(name: string, desiredSlug: string | undefined, excludeId?: string) {
  const base = desiredSlug || slugifyText(name);
  let slug = base;
  let suffix = 1;
  while (
    await prisma.category.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })
  ) {
    slug = `${base}-${++suffix}`;
  }
  return slug;
}

export async function createCategoryAdmin(input: CategoryAdminInput) {
  const slug = await resolveUniqueSlug(input.name, input.slug || undefined);
  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      galleryImages: input.galleryImages,
      parentId: input.parentId || null,
      displayOrder: input.displayOrder,
      isPublished: input.isPublished,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
    },
  });
}

export async function updateCategoryAdmin(id: string, input: CategoryAdminInput) {
  if (input.parentId === id) {
    throw new Error("A category cannot be its own parent");
  }
  const slug = await resolveUniqueSlug(input.name, input.slug || undefined, id);
  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      galleryImages: input.galleryImages,
      parentId: input.parentId || null,
      displayOrder: input.displayOrder,
      isPublished: input.isPublished,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
    },
  });
}

export async function deleteCategoryAdmin(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  });
  if (!category) return;

  if (category._count.products > 0 || category._count.children > 0) {
    throw new Error("Cannot delete a category that still has products or subcategories");
  }

  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function toggleCategoryPublished(id: string, isPublished: boolean) {
  return prisma.category.update({ where: { id }, data: { isPublished } });
}
