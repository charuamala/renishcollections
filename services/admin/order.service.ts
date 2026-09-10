import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export async function listOrdersForAdmin(filters: { status?: OrderStatus; page?: number; pageSize?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));

  const where = filters.status ? { status: filters.status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        grandTotal: true,
        createdAt: true,
        trackingNumber: true,
        user: { select: { name: true, email: true } },
        payment: { select: { status: true, provider: true } },
        items: { select: { id: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, pageSize };
}

export async function updateOrderStatusAdmin(orderId: string, status: OrderStatus, trackingNumber?: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      trackingNumber: trackingNumber || undefined,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
      cancelledAt: status === "CANCELLED" ? new Date() : undefined,
    },
  });
}
