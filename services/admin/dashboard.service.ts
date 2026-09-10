import "server-only";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    totalSalesAgg,
    todaySalesAgg,
    monthSalesAgg,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    topSellingRaw,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: monthStart } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { deletedAt: null } }),
    // Prisma's `where` can't compare two columns of the same row directly,
    // so low-stock (0 < stock <= lowStockThreshold) is filtered in JS.
    prisma.product
      .findMany({
        where: { deletedAt: null, stock: { gt: 0 } },
        select: { id: true, name: true, stock: true, lowStockThreshold: true },
      })
      .then((rows) => rows.filter((p) => p.stock <= p.lowStockThreshold).slice(0, 10)),
    prisma.product.count({ where: { deletedAt: null, stock: 0 } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const topProductIds = topSellingRaw.map((r) => r.productId);
  const topProducts = topProductIds.length
    ? await prisma.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, name: true, slug: true } })
    : [];
  const topSelling = topSellingRaw.map((row) => ({
    product: topProducts.find((p) => p.id === row.productId) ?? null,
    quantitySold: row._sum.quantity ?? 0,
  }));

  return {
    totalSales: new Decimal(totalSalesAgg._sum.grandTotal ?? 0),
    todaySales: new Decimal(todaySalesAgg._sum.grandTotal ?? 0),
    monthSales: new Decimal(monthSalesAgg._sum.grandTotal ?? 0),
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    topSelling,
    recentOrders,
  };
}
