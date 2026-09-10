import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      orders: { select: { grandTotal: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-charcoal">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
              return (
                <tr key={customer.id}>
                  <td className="p-3 font-medium text-charcoal">{customer.name ?? "—"}</td>
                  <td className="p-3 text-ink-600">{customer.email}</td>
                  <td className="p-3 text-ink-600">{customer.phone ?? "—"}</td>
                  <td className="p-3 text-ink-600">{customer.orders.length}</td>
                  <td className="p-3 text-ink-600">{formatPrice(totalSpent)}</td>
                  <td className="p-3 text-ink-400">
                    {customer.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="p-3">
                    <span className={customer.isActive ? "text-success" : "text-error"}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-6 text-center text-sm text-ink-600">No customers yet.</p>}
      </div>
    </div>
  );
}
