export interface LogAuditEventParams {
  actorId?: string | null;
  actorType?: "ADMIN" | "SELLER" | "AGENT" | "SYSTEM" | "BUYER";
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export async function logAuditEvent(prisma: any, params: LogAuditEventParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorType: params.actorType || "SYSTEM",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        beforeState: params.beforeState ? JSON.stringify(params.beforeState) : null,
        afterState: params.afterState ? JSON.stringify(params.afterState) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        requestId: params.requestId || null,
      },
    });
  } catch (error) {
    console.error("Failed to append immutable audit log:", error);
    return null;
  }
}

