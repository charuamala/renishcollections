"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authorization";
import { logAdminAction } from "@/lib/audit";
import { categoryAdminSchema } from "@/schemas/admin/category.schema";
import {
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  toggleCategoryPublished,
} from "@/services/admin/category.service";

const CATEGORY_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"] as const;

export interface CategoryFormState {
  error?: string;
  success?: boolean;
}

function parseForm(formData: FormData) {
  return categoryAdminSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    parentId: formData.get("parentId"),
    displayOrder: formData.get("displayOrder") || 0,
    isPublished: formData.get("isPublished") === "on",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
}

export async function createCategoryAction(_prevState: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details" };

  const user = await requireRole([...CATEGORY_ROLES]);
  const category = await createCategoryAdmin(parsed.data);
  await logAdminAction({ adminId: user.id, action: "category.created", entityType: "Category", entityId: category.id });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details" };

  const user = await requireRole([...CATEGORY_ROLES]);
  try {
    await updateCategoryAdmin(id, parsed.data);
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    throw error;
  }
  await logAdminAction({ adminId: user.id, action: "category.updated", entityType: "Category", entityId: id });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<CategoryFormState> {
  const user = await requireRole([...CATEGORY_ROLES]);
  try {
    await deleteCategoryAdmin(id);
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    throw error;
  }
  await logAdminAction({ adminId: user.id, action: "category.deleted", entityType: "Category", entityId: id });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function toggleCategoryPublishedAction(id: string, isPublished: boolean) {
  const user = await requireRole([...CATEGORY_ROLES]);
  await toggleCategoryPublished(id, isPublished);
  await logAdminAction({
    adminId: user.id,
    action: isPublished ? "category.published" : "category.unpublished",
    entityType: "Category",
    entityId: id,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
