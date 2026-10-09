import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { getCartTotals } from "@/services/cart.service";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const session = await auth();
  const cart = await getCartTotals(session?.user?.id ?? null);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-600">Explore our collection and find something you love.</p>
        <Button href="/shop" size="lg" className="mt-6">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-charcoal">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {cart.lines.map((line) => (
            <CartLineItem
              key={line.id}
              line={{
                id: line.id,
                productId: line.productId,
                variantId: line.variantId,
                name: line.name,
                variantLabel: line.variantLabel,
                href: line.href,
                image: line.image,
                quantity: line.quantity,
                availableStock: line.availableStock,
                isAvailable: line.isAvailable,
                lineTotal: line.lineTotal.toString(),
              }}
            />
          ))}
        </div>

        <div className="h-fit rounded-sm border border-border bg-cream p-6">
          <h2 className="text-sm font-semibold text-charcoal">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-600">Subtotal</dt>
              <dd className="font-medium text-charcoal">{formatPrice(cart.subtotal)}</dd>
            </div>
            {cart.discountTotal.greaterThan(0) && (
              <div className="flex justify-between">
                <dt className="text-ink-600">Discount</dt>
                <dd className="font-medium text-success">-{formatPrice(cart.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-600">Shipping</dt>
              <dd className="font-medium text-charcoal">
                {cart.shippingTotal.equals(0) ? "Free" : formatPrice(cart.shippingTotal)}
              </dd>
            </div>
            {cart.taxTotal.greaterThan(0) && (
              <div className="flex justify-between">
                <dt className="text-ink-600">GST</dt>
                <dd className="font-medium text-charcoal">{formatPrice(cart.taxTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-charcoal">
              <dt>Total</dt>
              <dd>{formatPrice(cart.grandTotal)}</dd>
            </div>
          </dl>
          <Button href="/checkout" fullWidth size="lg" className="mt-6">
            Proceed to Checkout
          </Button>
          <p className="mt-2 text-center text-xs text-ink-600">You&apos;ll send your order to us on WhatsApp.</p>
          <Link href="/shop" className="mt-3 block text-center text-xs text-ink-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
