import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type BookingStatus =
  | "inquiry"
  | "pending_payment"
  | "confirmed"
  | "in_use"
  | "returned"
  | "cancelled";

export type ReturnCondition = "good" | "minor_damage" | "major_damage" | "missing_items";

export const RETURN_CONDITIONS: ReturnCondition[] = [
  "good",
  "minor_damage",
  "major_damage",
  "missing_items",
];

export interface IBooking extends Document {
  _id: Types.ObjectId;
  bookingNumber: string;
  customer: Types.ObjectId;
  product: Types.ObjectId;
  size: string;
  rentalStartDate: Date;
  rentalEndDate: Date;
  eventDate: Date;
  status: BookingStatus;
  rentalFee: number;
  securityDeposit: number;
  totalAmount: number;
  deliveryAddress: string;
  notes?: string;
  returnCondition?: ReturnCondition;
  returnNotes?: string;
  returnedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    size: { type: String, required: true },
    rentalStartDate: { type: Date, required: true },
    rentalEndDate: { type: Date, required: true },
    eventDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["inquiry", "pending_payment", "confirmed", "in_use", "returned", "cancelled"],
      default: "inquiry",
      index: true,
    },
    rentalFee: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true },
    notes: { type: String },
    returnCondition: { type: String, enum: RETURN_CONDITIONS },
    returnNotes: { type: String },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Booking: Model<IBooking> =
  models.Booking ?? model<IBooking>("Booking", bookingSchema);
