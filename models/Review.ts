import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  product?: Types.ObjectId;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    customerName: { type: String, required: true },
    customerAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isApproved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  models.Review ?? model<IReview>("Review", reviewSchema);
