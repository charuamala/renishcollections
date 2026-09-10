"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  addItemForUser,
  addItemForGuest,
  updateItemQuantityForUser,
  updateItemQuantityForGuest,
  removeItemForUser,
  removeItemForGuest,
} from "@/services/cart.service";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable(),
  quantity: z.number().int().min(1).max(20),
});

export async function addToCartAction(input: z.infer<typeof addToCartSchema>) {
  const { productId, variantId, quantity } = addToCartSchema.parse(input);
  const session = await auth();

  if (session?.user?.id) {
    await addItemForUser(session.user.id, productId, variantId, quantity);
  } else {
    await addItemForGuest(productId, variantId, quantity);
  }

  revalidatePath("/cart");
  return { success: true };
}

const updateQuantitySchema = z.object({
  cartItemId: z.string().min(1), // logged-in: real cart item id. guest: "productId:variantId"
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable(),
  quantity: z.number().int().min(0).max(20),
});

export async function updateCartItemAction(input: z.infer<typeof updateQuantitySchema>) {
  const { cartItemId, productId, variantId, quantity } = updateQuantitySchema.parse(input);
  const session = await auth();

  if (session?.user?.id) {
    await updateItemQuantityForUser(session.user.id, cartItemId, quantity);
  } else {
    await updateItemQuantityForGuest(productId, variantId, quantity);
  }

  revalidatePath("/cart");
  return { success: true };
}

const removeItemSchema = z.object({
  cartItemId: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable(),
});

export async function removeCartItemAction(input: z.infer<typeof removeItemSchema>) {
  const { cartItemId, productId, variantId } = removeItemSchema.parse(input);
  const session = await auth();

  if (session?.user?.id) {
    await removeItemForUser(session.user.id, cartItemId);
  } else {
    await removeItemForGuest(productId, variantId);
  }

  revalidatePath("/cart");
  return { success: true };
}
