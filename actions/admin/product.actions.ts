"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/authorization";
import { logAdminAction } from "@/lib/audit";
import { productAdminSchema } from "@/schemas/admin/product.schema";
import {
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  duplicateProductAdmin,
  toggleProductField,
  toggleProductStatus,
} from "@/services/admin/product.service";

const PRODUCT_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER"] as const;

export interface ProductFormState {
  error?: string;
  success?: boolean;
  productId?: string;
}

function parsePayload(payload: unknown) {
  return productAdminSchema.safeParse(payload);
}

/** Maps a raw unique-constraint violation (e.g. a duplicate variant SKU the pre-checks didn't cover) to a friendly message instead of a raw Prisma error. */
function friendlySaveError(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "a field";
    return `A product or variant with the same ${target} already exists`;
  }
  if (error instanceof Error) return error.message;
  return null;
}

export async function createProductAction(payload: unknown): Promise<ProductFormState> {
  const parsed = parsePayload(payload);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details" };

  const user = await requireRole([...PRODUCT_ROLES]);
  let product;
  try {
    product = await createProductAdmin(parsed.data);
  } catch (error) {
    const message = friendlySaveError(error);
    if (message) return { error: message };
    throw error;
  }
  await logAdminAction({
    adminId: user.id,
    action: "product.created",
    entityType: "Product",
    entityId: product.id,
    metadata: { name: product.name, sku: product.sku },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, productId: product.id };
}

export async function updateProductAction(id: string, payload: unknown): Promise<ProductFormState> {
  const parsed = parsePayload(payload);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details" };

  const user = await requireRole([...PRODUCT_ROLES]);
  let product;
  try {
    product = await updateProductAdmin(id, parsed.data);
  } catch (error) {
    const message = friendlySaveError(error);
    if (message) return { error: message };
    throw error;
  }
  await logAdminAction({
    adminId: user.id,
    action: "product.updated",
    entityType: "Product",
    entityId: id,
    metadata: { name: product.name },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/[categorySlug]/[slug]`, "page");
  return { success: true, productId: product.id };
}

export async function deleteProductAction(id: string) {
  const user = await requireRole([...PRODUCT_ROLES]);
  await deleteProductAdmin(id);
  await logAdminAction({ adminId: user.id, action: "product.deleted", entityType: "Product", entityId: id });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function duplicateProductAction(id: string) {
  const user = await requireRole([...PRODUCT_ROLES]);
  const copy = await duplicateProductAdmin(id);
  await logAdminAction({ adminId: user.id, action: "product.duplicated", entityType: "Product", entityId: copy.id });
  revalidatePath("/admin/products");
  return { productId: copy.id };
}

export async function toggleProductFieldAction(
  id: string,
  field: "isFeatured" | "isNewArrival" | "isBestSeller",
  value: boolean,
) {
  const user = await requireRole([...PRODUCT_ROLES]);
  await toggleProductField(id, field, value);
  await logAdminAction({ adminId: user.id, action: `product.${field}.${value}`, entityType: "Product", entityId: id });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductStatusAction(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  const user = await requireRole([...PRODUCT_ROLES]);
  await toggleProductStatus(id, status);
  await logAdminAction({ adminId: user.id, action: `product.status.${status}`, entityType: "Product", entityId: id });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
