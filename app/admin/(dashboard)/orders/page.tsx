import type { Metadata } from "next";
import { listOrdersForAdmin } from "@/services/admin/order.service";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Pagination } from "@/components/shop/pagination";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { orders, total, pageSize } = await listOrdersForAdmin({ page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-charcoal">Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Tracking</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-3 font-medium text-charcoal">#{order.orderNumber}</td>
                <td className="p-3 text-ink-600">{order.user.name ?? order.user.email}</td>
                <td className="p-3 text-ink-600">{order.items.length}</td>
                <td className="p-3 text-ink-600">{formatPrice(order.grandTotal)}</td>
                <td className="p-3 text-ink-600">{order.payment?.status ?? "—"}</td>
                <td className="p-3 text-ink-600">{order.trackingNumber ?? "—"}</td>
                <td className="p-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-sm text-ink-600">No orders yet.</p>}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath="/admin/orders" searchParams={new URLSearchParams()} />
    </div>
  );
}
