import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    heroImage: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  models.Category ?? model<ICategory>("Category", categorySchema);
