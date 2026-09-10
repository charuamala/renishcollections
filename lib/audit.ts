import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface LogAdminActionInput {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  orderId?: string;
  metadata?: Prisma.InputJsonValue;
}

/** Records an admin action for the audit trail. Never throws — a logging failure must not break the underlying admin action. */
export async function logAdminAction(input: LogAdminActionInput) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        orderId: input.orderId,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("[audit] failed to record admin action", input.action, error);
  }
}
