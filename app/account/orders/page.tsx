import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await requireUserOrRedirect("/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, status: true, grandTotal: true, createdAt: true, items: { select: { id: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-charcoal">My Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink-600">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-sm border border-border bg-white">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-charcoal">#{order.orderNumber}</p>
                <p className="text-xs text-ink-400">
                  {order.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })} ·{" "}
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-charcoal">{formatPrice(order.grandTotal)}</span>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
