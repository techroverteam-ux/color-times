import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type AuditEntityId = Types.ObjectId | string;

export type AuditAction =
  | "create"
  | "update"
  | "archive"
  | "restore"
  | "delete"
  | "status_change"
  | "bulk_update"
  | "bulk_delete"
  | "import";

export interface AuditFieldChange {
  field: string;
  from: unknown;
  to: unknown;
}

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  entityType: string;
  entityId: AuditEntityId;
  action: AuditAction;
  actorId: Types.ObjectId;
  actorName: string;
  actorEmail: string;
  changes: AuditFieldChange[];
  snapshot?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditFieldChangeSchema = new Schema<AuditFieldChange>(
  {
    field: { type: String, required: true },
    from: { type: Schema.Types.Mixed },
    to: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const auditLogSchema = new Schema<IAuditLog>(
  {
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.Mixed, required: true, index: true },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "archive",
        "restore",
        "delete",
        "status_change",
        "bulk_update",
        "bulk_delete",
        "import",
      ],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true },
    actorEmail: { type: String, required: true },
    changes: { type: [auditFieldChangeSchema], default: [] },
    snapshot: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  models.AuditLog ?? model<IAuditLog>("AuditLog", auditLogSchema);
