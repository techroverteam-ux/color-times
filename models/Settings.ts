import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ISettings extends Document {
  _id: Types.ObjectId;
  module: string;
  data: Record<string, unknown>;
  updatedBy: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    module: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  models.Settings ?? model<ISettings>("Settings", settingsSchema);
