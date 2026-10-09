import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCartTotals } from "@/services/cart.service";
import { getSiteSettings } from "@/services/settings.service";
import { WhatsAppCheckoutForm } from "@/components/checkout/whatsapp-checkout-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/** Orders are placed over WhatsApp: the shopper adds delivery details and sends a pre-written order message. */
export default async function CheckoutPage() {
  const session = await auth();
  const [cart, settings] = await Promise.all([getCartTotals(session?.user?.id ?? null), getSiteSettings()]);

  if (cart.lines.length === 0) redirect("/cart");

  const whatsappNumber = (settings.whatsappNumber || settings.contactPhone || "").replace(/\D/g, "");
  const unavailable = cart.lines.filter((l) => !l.isAvailable);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { name: "Cart", href: "/cart" },
          { name: "Checkout", href: "/checkout" },
        ]}
      />
      <h1 className="mt-4 font-display text-3xl font-semibold text-charcoal">Checkout</h1>
      <p className="mt-2 text-sm text-ink-600">
        Add your delivery details and send your order to us on WhatsApp.
        {!settings.codAvailable && " Prepaid orders only."}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="delivery-heading">
          {/* On phones the full summary sits below the form, so show what's being ordered up front. */}
          <p className="mb-6 flex items-center justify-between rounded-sm bg-cream px-4 py-3 text-sm lg:hidden">
            <span className="text-ink-600">
              {cart.lines.reduce((n, l) => n + l.quantity, 0)}{" "}
              {cart.lines.length === 1 && cart.lines[0].quantity === 1 ? "item" : "items"}
            </span>
            <span className="font-semibold text-charcoal">Total {formatPrice(cart.grandTotal)}</span>
          </p>
          <h2 id="delivery-heading" className="text-lg font-semibold text-charcoal">
            Delivery details
          </h2>
          <div className="mt-4">
            {unavailable.length > 0 ? (
              <p className="rounded-sm bg-cream p-4 text-sm text-charcoal">
                {unavailable.map((l) => l.name).join(", ")} {unavailable.length === 1 ? "is" : "are"} no longer
                available.{" "}
                <Link href="/cart" className="font-medium text-maroon-600 underline">
                  Update your cart
                </Link>{" "}
                to continue.
              </p>
            ) : whatsappNumber ? (
              <WhatsAppCheckoutForm
                whatsappNumber={whatsappNumber.length === 10 ? `91${whatsappNumber}` : whatsappNumber}
                lines={cart.lines.map((l) => ({
                  name: l.name,
                  variantLabel: l.variantLabel,
                  quantity: l.quantity,
                  lineTotal: formatPrice(l.lineTotal),
                  href: l.href,
                }))}
                subtotal={formatPrice(cart.subtotal)}
                shipping={cart.shippingTotal.equals(0) ? "Free" : formatPrice(cart.shippingTotal)}
                tax={cart.taxTotal.greaterThan(0) ? formatPrice(cart.taxTotal) : null}
                total={formatPrice(cart.grandTotal)}
              />
            ) : (
              <p className="text-sm text-ink-600">Online ordering will open soon. Please contact us to order.</p>
            )}
          </div>
        </section>

        <aside aria-labelledby="summary-heading" className="h-fit rounded-sm border border-border bg-cream p-6">
          <h2 id="summary-heading" className="text-sm font-semibold text-charcoal">
            Order summary
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex gap-3 py-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-white">
                  {line.image && (
                    <Image
                      src={line.image.url}
                      alt={line.image.altText || line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-2 font-medium text-charcoal">{line.name}</p>
                  {line.variantLabel && <p className="mt-0.5 text-xs text-ink-600">{line.variantLabel}</p>}
                  <p className="mt-1 text-xs text-ink-600">Qty {line.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-charcoal">{formatPrice(line.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-600">Subtotal</dt>
              <dd className="font-medium text-charcoal">{formatPrice(cart.subtotal)}</dd>
            </div>
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
          {settings.deliveryTime && <p className="mt-4 text-xs text-ink-600">Delivered in {settings.deliveryTime}.</p>}
        </aside>
      </div>
    </div>
  );
}
