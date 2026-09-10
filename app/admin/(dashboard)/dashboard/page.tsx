import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/services/admin/dashboard.service";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-charcoal">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Sales" value={formatPrice(stats.totalSales)} />
        <StatCard label="Today's Sales" value={formatPrice(stats.todaySales)} />
        <StatCard label="Monthly Sales" value={formatPrice(stats.monthSales)} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} tone="warning" />
        <StatCard label="Delivered Orders" value={stats.deliveredOrders} tone="success" />
        <StatCard label="Cancelled Orders" value={stats.cancelledOrders} tone="error" />
        <StatCard label="Total Customers" value={stats.totalCustomers} />
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Low Stock" value={stats.lowStockProducts.length} tone="warning" />
        <StatCard label="Out of Stock" value={stats.outOfStockProducts} tone="error" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-charcoal">Top Selling Products</h2>
          {stats.topSelling.length === 0 ? (
            <p className="mt-3 text-sm text-ink-600">No sales data yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {stats.topSelling.map(({ product, quantitySold }) => (
                <li key={product?.id} className="flex justify-between py-2">
                  <span className="text-charcoal">{product?.name ?? "Deleted product"}</span>
                  <span className="text-ink-600">{quantitySold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-sm border border-border bg-white p-4">
          <h2 className="text-sm font-semibold text-charcoal">Low Stock Products</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="mt-3 text-sm text-ink-600">Nothing running low right now.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {stats.lowStockProducts.map((product) => (
                <li key={product.id} className="flex justify-between py-2">
                  <span className="text-charcoal">{product.name}</span>
                  <span className="text-gold-600">{product.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-charcoal">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-maroon-600 hover:underline">
            View All
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-600">No orders yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2">#{order.orderNumber}</td>
                    <td className="py-2">{order.user.name ?? order.user.email}</td>
                    <td className="py-2">
                      <Badge variant="outline">{order.status}</Badge>
                    </td>
                    <td className="py-2 text-right">{formatPrice(order.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
