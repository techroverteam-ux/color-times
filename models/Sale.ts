import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ISale extends Document {
  _id: Types.ObjectId;
  billNumber: string;
  saleDate: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  product: Types.ObjectId;
  details?: string;
  totalAmount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    billNumber: { type: String, required: true, unique: true, index: true },
    saleDate: { type: Date, required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    details: { type: String, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });

export const Sale: Model<ISale> = models.Sale ?? model<ISale>("Sale", saleSchema);
