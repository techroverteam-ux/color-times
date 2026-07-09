import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date },
    replacedByTokenHash: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RefreshToken: Model<IRefreshToken> =
  models.RefreshToken ?? model<IRefreshToken>("RefreshToken", refreshTokenSchema);
