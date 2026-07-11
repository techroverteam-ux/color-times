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

export interface BookingItem {
  product: Types.ObjectId;
  size: string;
  quantity: number;
  pricePerDay: number;
  rentalFee: number;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  bookingNumber: string;
  customer: Types.ObjectId;
  items: BookingItem[];
  rentalStartDate: Date;
  rentalEndDate: Date;
  eventDate: Date;
  status: BookingStatus;
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

const bookingItemSchema = new Schema<BookingItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    pricePerDay: { type: Number, required: true, min: 0 },
    rentalFee: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: {
      type: [bookingItemSchema],
      required: true,
      validate: {
        validator: (items: BookingItem[]) => items.length > 0,
        message: "A booking requires at least one item.",
      },
    },
    rentalStartDate: { type: Date, required: true },
    rentalEndDate: { type: Date, required: true },
    eventDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["inquiry", "pending_payment", "confirmed", "in_use", "returned", "cancelled"],
      default: "inquiry",
      index: true,
    },
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
