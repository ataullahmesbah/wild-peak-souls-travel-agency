import { prisma } from '@/lib/db';
import type { AuditAction, LogLevel, ActivityType } from '@prisma/client';
import type { InputJsonValue } from '@prisma/client/runtime/library';

type JsonValue = InputJsonValue;

interface AuditLogEntry {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  userId?: string;
  actorId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, JsonValue>;
  oldValues?: Record<string, JsonValue>;
  newValues?: Record<string, JsonValue>;
  success?: boolean;
  errorMessage?: string;
  level?: LogLevel;
}

export const auditLogger = {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          userId: entry.userId,
          actorId: entry.actorId ?? entry.userId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata ?? {},
          oldValues: entry.oldValues,
          newValues: entry.newValues,
          success: entry.success ?? true,
          errorMessage: entry.errorMessage,
          level: entry.level ?? 'INFO',
        },
      });
    } catch {
      // Never let audit logging crash the main flow
      console.error('[AuditLog] Failed to write audit log:', entry);
    }
  },

  async logActivity(entry: {
    userId?: string;
    type: ActivityType;
    action: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    metadata?: Record<string, JsonValue>;
  }): Promise<void> {
    try {
      await prisma.activityLog.create({ data: entry });
    } catch {
      console.error('[ActivityLog] Failed to write activity log:', entry);
    }
  },
};
