"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { toggleWishlistForUser, toggleWishlistForGuest } from "@/services/wishlist.service";
import { addItemForUser, addItemForGuest } from "@/services/cart.service";
import { prisma } from "@/lib/prisma";

const toggleSchema = z.object({ productId: z.string().min(1) });

export async function toggleWishlistAction(input: z.infer<typeof toggleSchema>) {
  const { productId } = toggleSchema.parse(input);
  const session = await auth();

  const result = session?.user?.id
    ? await toggleWishlistForUser(session.user.id, productId)
    : await toggleWishlistForGuest(productId);

  revalidatePath("/account/wishlist");
  return result;
}

const moveToCartSchema = z.object({ productId: z.string().min(1) });

export async function moveWishlistItemToCartAction(input: z.infer<typeof moveToCartSchema>) {
  const { productId } = moveToCartSchema.parse(input);
  const session = await auth();

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, stock: true } });
  if (!product || product.stock <= 0) {
    return { success: false, error: "This product is currently out of stock" };
  }

  if (session?.user?.id) {
    await addItemForUser(session.user.id, productId, null, 1);
    await toggleWishlistForUser(session.user.id, productId);
  } else {
    await addItemForGuest(productId, null, 1);
    await toggleWishlistForGuest(productId);
  }

  revalidatePath("/account/wishlist");
  revalidatePath("/cart");
  return { success: true };
}
