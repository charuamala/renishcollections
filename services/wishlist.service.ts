import { prisma } from "@/lib/prisma";
import { readGuestWishlist, writeGuestWishlist, clearGuestWishlist } from "@/lib/guest-cart";
import { productHref } from "@/lib/product-url";

async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({ where: { userId }, update: {}, create: { userId } });
}

export async function toggleWishlistForUser(userId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { wishlisted: false };
  }
  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  return { wishlisted: true };
}

export async function toggleWishlistForGuest(productId: string) {
  const ids = await readGuestWishlist();
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
  await writeGuestWishlist(next);
  return { wishlisted: !exists };
}

export async function getWishlistProductIdsForUser(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { items: { select: { productId: true } } },
  });
  return wishlist?.items.map((i) => i.productId) ?? [];
}

export async function getWishlistProductsForUser(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: {
      items: {
        select: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sellingPrice: true,
              originalPrice: true,
              stock: true,
              images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true, altText: true } },
              category: { select: { slug: true, parent: { select: { slug: true } } } },
            },
          },
        },
      },
    },
  });
  return (
    wishlist?.items.map((i) => ({
      ...i.product,
      href: productHref(i.product),
    })) ?? []
  );
}

export async function mergeGuestWishlistIntoUser(userId: string) {
  const guestIds = await readGuestWishlist();
  if (guestIds.length === 0) return;

  const wishlist = await getOrCreateWishlist(userId);
  await prisma.wishlistItem.createMany({
    data: guestIds.map((productId) => ({ wishlistId: wishlist.id, productId })),
    skipDuplicates: true,
  });
  await clearGuestWishlist();
}
