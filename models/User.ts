import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export type UserRole = "customer" | "staff" | "admin" | "developer" | "super_admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  fatherName?: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isActive: boolean;
  wishlist: Types.ObjectId[];
  addresses: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    fatherName: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "staff", "admin", "developer", "super_admin"],
      default: "customer",
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User ?? model<IUser>("User", userSchema);
