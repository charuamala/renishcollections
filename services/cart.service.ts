import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/services/settings.service";
import { readGuestCart, writeGuestCart, clearGuestCart, type GuestCartLine } from "@/lib/guest-cart";
import { productHref } from "@/lib/product-url";

const LINE_SELECT = {
  id: true,
  quantity: true,
  productId: true,
  variantId: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sellingPrice: true,
      stock: true,
      status: true,
      images: { orderBy: { displayOrder: "asc" as const }, take: 1, select: { url: true, altText: true } },
      category: { select: { slug: true, parent: { select: { slug: true } } } },
    },
  },
  variant: {
    select: { id: true, sku: true, attributes: true, price: true, stock: true, isAvailable: true },
  },
} as const;

export interface CartLineView {
  id: string; // cartItemId for logged-in users, `${productId}:${variantId ?? ""}` for guests
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  href: string;
  image: { url: string; altText: string | null } | null;
  unitPrice: Decimal;
  quantity: number;
  availableStock: number;
  isAvailable: boolean;
  lineTotal: Decimal;
}

export interface CartTotals {
  lines: CartLineView[];
  subtotal: Decimal;
  discountTotal: Decimal;
  shippingTotal: Decimal;
  taxTotal: Decimal;
  grandTotal: Decimal;
}

async function getOrCreateUserCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

/**
 * Prisma's compound-unique lookup type only accepts a non-null value for a
 * nullable member (Postgres treats NULL as distinct from itself, so the
 * constraint can't be used as a unique key when variantId is absent) — so a
 * null variant is upserted manually instead of via the compound `where`.
 */
async function upsertCartItem(cartId: string, productId: string, variantId: string | null, quantity: number) {
  if (variantId) {
    return prisma.cartItem.upsert({
      where: { cartId_productId_variantId: { cartId, productId, variantId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, productId, variantId, quantity },
    });
  }

  const existing = await prisma.cartItem.findFirst({ where: { cartId, productId, variantId: null } });
  if (existing) {
    return prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: quantity } } });
  }
  return prisma.cartItem.create({ data: { cartId, productId, variantId: null, quantity } });
}

export async function addItemForUser(userId: string, productId: string, variantId: string | null, quantity: number) {
  const cart = await getOrCreateUserCart(userId);
  return upsertCartItem(cart.id, productId, variantId, quantity);
}

export async function updateItemQuantityForUser(userId: string, cartItemId: string, quantity: number) {
  const cart = await getOrCreateUserCart(userId);
  if (quantity <= 0) {
    return prisma.cartItem.deleteMany({ where: { id: cartItemId, cartId: cart.id } });
  }
  return prisma.cartItem.updateMany({ where: { id: cartItemId, cartId: cart.id }, data: { quantity } });
}

export async function removeItemForUser(userId: string, cartItemId: string) {
  const cart = await getOrCreateUserCart(userId);
  return prisma.cartItem.deleteMany({ where: { id: cartItemId, cartId: cart.id } });
}

export async function addItemForGuest(productId: string, variantId: string | null, quantity: number) {
  const lines = await readGuestCart();
  const existing = lines.find((l) => l.productId === productId && l.variantId === variantId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push({ productId, variantId, quantity });
  }
  await writeGuestCart(lines);
}

export async function updateItemQuantityForGuest(productId: string, variantId: string | null, quantity: number) {
  let lines = await readGuestCart();
  if (quantity <= 0) {
    lines = lines.filter((l) => !(l.productId === productId && l.variantId === variantId));
  } else {
    lines = lines.map((l) => (l.productId === productId && l.variantId === variantId ? { ...l, quantity } : l));
  }
  await writeGuestCart(lines);
}

export async function removeItemForGuest(productId: string, variantId: string | null) {
  const lines = await readGuestCart();
  await writeGuestCart(lines.filter((l) => !(l.productId === productId && l.variantId === variantId)));
}

/** Moves a guest's cookie-based cart into their DB cart on login. Never overwrites existing quantities silently — merges by incrementing. */
export async function mergeGuestCartIntoUser(userId: string) {
  const guestLines = await readGuestCart();
  if (guestLines.length === 0) return;

  const cart = await getOrCreateUserCart(userId);
  for (const line of guestLines) {
    await upsertCartItem(cart.id, line.productId, line.variantId, line.quantity);
  }
  await clearGuestCart();
}

async function hydrateGuestLines(guestLines: GuestCartLine[]): Promise<CartLineView[]> {
  if (guestLines.length === 0) return [];

  const productIds = [...new Set(guestLines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: LINE_SELECT.product.select,
  });
  const variantIds = guestLines.map((l) => l.variantId).filter((id): id is string => !!id);
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } }, select: LINE_SELECT.variant.select })
    : [];

  return guestLines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      const variant = line.variantId ? variants.find((v) => v.id === line.variantId) : null;
      const unitPrice = new Decimal(variant?.price ?? product.sellingPrice);
      const availableStock = variant?.stock ?? product.stock;
      return {
        id: `${line.productId}:${line.variantId ?? ""}`,
        productId: line.productId,
        variantId: line.variantId,
        name: product.name,
        slug: product.slug,
        href: productHref(product),
        image: product.images.at(0) ?? null,
        unitPrice,
        quantity: line.quantity,
        availableStock,
        isAvailable: product.status === "PUBLISHED" && (variant?.isAvailable ?? true) && availableStock > 0,
        lineTotal: unitPrice.times(line.quantity),
      } satisfies CartLineView;
    })
    .filter((l): l is CartLineView => l !== null);
}

async function hydrateUserLines(userId: string): Promise<CartLineView[]> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { select: LINE_SELECT } },
  });
  if (!cart) return [];

  return cart.items.map((item) => {
    const unitPrice = new Decimal(item.variant?.price ?? item.product.sellingPrice);
    const availableStock = item.variant?.stock ?? item.product.stock;
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      slug: item.product.slug,
      href: productHref(item.product),
      image: item.product.images.at(0) ?? null,
      unitPrice,
      quantity: item.quantity,
      availableStock,
      isAvailable: item.product.status === "PUBLISHED" && (item.variant?.isAvailable ?? true) && availableStock > 0,
      lineTotal: unitPrice.times(item.quantity),
    } satisfies CartLineView;
  });
}

/** Computes the full, server-verified cart with pricing — the only source of truth for totals. */
export async function getCartTotals(userId: string | null): Promise<CartTotals> {
  const lines = userId ? await hydrateUserLines(userId) : await hydrateGuestLines(await readGuestCart());
  const settings = await getSiteSettings();

  const subtotal = lines.reduce((sum, l) => sum.plus(l.lineTotal), new Decimal(0));
  const discountTotal = new Decimal(0); // coupon logic applied in services/coupon.service.ts

  const freeShippingThreshold = settings.freeShippingThreshold ? new Decimal(settings.freeShippingThreshold) : null;
  const shippingTotal =
    freeShippingThreshold && subtotal.greaterThanOrEqualTo(freeShippingThreshold) ? new Decimal(0) : new Decimal(subtotal.greaterThan(0) ? 99 : 0);

  const taxableAmount = subtotal.minus(discountTotal);
  const taxTotal = taxableAmount.times(new Decimal(settings.taxPercentage)).dividedBy(100).toDecimalPlaces(2);

  const grandTotal = subtotal.minus(discountTotal).plus(shippingTotal).plus(taxTotal);

  return { lines, subtotal, discountTotal, shippingTotal, taxTotal, grandTotal };
}

export async function getCartItemCount(userId: string | null): Promise<number> {
  if (userId) {
    const cart = await prisma.cart.findUnique({ where: { userId }, select: { items: { select: { quantity: true } } } });
    return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }
  const lines = await readGuestCart();
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
