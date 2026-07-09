import "server-only";
import {
  AuditLog,
  type AuditAction,
  type AuditEntityId,
  type AuditFieldChange,
} from "@/models/AuditLog";
import type { AccessTokenPayload } from "@/lib/auth/tokens";

const IGNORED_FIELDS = new Set(["_id", "__v", "updatedAt", "createdAt", "passwordHash"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function diffObjects(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>
): AuditFieldChange[] {
  const changes: AuditFieldChange[] = [];
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)]);

  for (const key of keys) {
    if (IGNORED_FIELDS.has(key)) continue;

    const fromValue = before ? before[key] : undefined;
    const toValue = after[key];
    const fromComparable = isPlainObject(fromValue) || Array.isArray(fromValue)
      ? JSON.stringify(fromValue)
      : fromValue;
    const toComparable = isPlainObject(toValue) || Array.isArray(toValue)
      ? JSON.stringify(toValue)
      : toValue;

    if (fromComparable !== toComparable) {
      changes.push({ field: key, from: fromValue ?? null, to: toValue ?? null });
    }
  }

  return changes;
}

interface RecordAuditLogParams {
  entityType: string;
  entityId: AuditEntityId;
  action: AuditAction;
  actor: AccessTokenPayload;
  changes?: AuditFieldChange[];
  snapshot?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function recordAuditLog(params: RecordAuditLogParams): Promise<void> {
  await AuditLog.create({
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    actorId: params.actor.sub,
    actorName: params.actor.name,
    actorEmail: params.actor.email,
    changes: params.changes ?? [],
    snapshot: params.snapshot,
    metadata: params.metadata,
  });
}
