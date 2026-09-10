"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { requireRole } from "@/lib/authorization";
import { logAdminAction } from "@/lib/audit";
import { updateOrderStatusAdmin } from "@/services/admin/order.service";

const ORDER_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"] as const;

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, trackingNumber?: string) {
  const user = await requireRole([...ORDER_ROLES]);
  await updateOrderStatusAdmin(orderId, status, trackingNumber);
  await logAdminAction({
    adminId: user.id,
    action: `order.status.${status}`,
    entityType: "Order",
    entityId: orderId,
    orderId,
  });
  revalidatePath("/admin/orders");
}
