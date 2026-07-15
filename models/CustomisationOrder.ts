import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { measurementsSchema, type MeasurementValues } from "@/models/shared/measurements";

export type CustomisationOrderStatus =
  | "pending"
  | "in_progress"
  | "ready"
  | "delivered"
  | "cancelled";

export type CustomisationMeasurements = MeasurementValues;

export interface ICustomisationOrder extends Document {
  _id: Types.ObjectId;
  billNumber: string;
  orderDate: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  stitchingType: string;
  detail: string;
  measurements: CustomisationMeasurements;
  totalAmount: number;
  advancePayment: number;
  dueAmount: number;
  status: CustomisationOrderStatus;
  notes?: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const customisationOrderSchema = new Schema<ICustomisationOrder>(
  {
    billNumber: { type: String, required: true, unique: true, index: true },
    orderDate: { type: Date, required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    stitchingType: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
    measurements: { type: measurementsSchema, default: () => ({}) },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    advancePayment: { type: Number, required: true, min: 0, default: 0 },
    dueAmount: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in_progress", "ready", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: { type: String, trim: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

customisationOrderSchema.index({ status: 1, createdAt: -1 });

export const CustomisationOrder: Model<ICustomisationOrder> =
  models.CustomisationOrder ?? model<ICustomisationOrder>("CustomisationOrder", customisationOrderSchema);
