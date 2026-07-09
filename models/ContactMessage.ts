import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type ContactReason = "general" | "booking_inquiry" | "partnership" | "support";

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  reason: ContactReason;
  message: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    reason: {
      type: String,
      enum: ["general", "booking_inquiry", "partnership", "support"],
      default: "general",
    },
    message: { type: String, required: true, maxlength: 2000 },
    isResolved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const ContactMessage: Model<IContactMessage> =
  models.ContactMessage ?? model<IContactMessage>("ContactMessage", contactMessageSchema);
