import prisma from "./prisma";
import { SessionUser } from "./types";

export async function logAuditEvent({
  user,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: {
  user?: SessionUser | null;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || "System / Guest",
        userRole: user?.role || "GUEST",
        action,
        entity,
        entityId: entityId || null,
        detailsJson: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
