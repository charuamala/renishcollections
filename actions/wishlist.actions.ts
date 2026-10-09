"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { toggleWishlistForUser, toggleWishlistForGuest } from "@/services/wishlist.service";
import { addItemForUser, addItemForGuest, validateAddToCart } from "@/services/cart.service";

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

  // Products with colour options can't be added without a choice — the wishlist card links to the product page instead.
  const problem = await validateAddToCart(productId, null, 1);
  if (problem) {
    return { success: false, error: problem.message };
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
