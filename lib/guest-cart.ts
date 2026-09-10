import "server-only";
import { cookies } from "next/headers";
import { GUEST_CART_COOKIE, GUEST_WISHLIST_COOKIE } from "@/lib/constants";

export interface GuestCartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
}

/**
 * Guest cart/wishlist cookies store only ids + quantity — never prices.
 * Every read hydrates fresh data (and prices) from the database, so a
 * tampered cookie can at most request a product/quantity, never a price.
 */
export async function readGuestCart(): Promise<GuestCartLine[]> {
  const store = await cookies();
  const raw = store.get(GUEST_CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is GuestCartLine =>
        typeof line?.productId === "string" &&
        (line.variantId === null || typeof line.variantId === "string") &&
        typeof line.quantity === "number" &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

export async function writeGuestCart(lines: GuestCartLine[]) {
  const store = await cookies();
  store.set(GUEST_CART_COOKIE, JSON.stringify(lines), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearGuestCart() {
  const store = await cookies();
  store.delete(GUEST_CART_COOKIE);
}

export async function readGuestWishlist(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(GUEST_WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function writeGuestWishlist(productIds: string[]) {
  const store = await cookies();
  store.set(GUEST_WISHLIST_COOKIE, JSON.stringify(productIds), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearGuestWishlist() {
  const store = await cookies();
  store.delete(GUEST_WISHLIST_COOKIE);
}
