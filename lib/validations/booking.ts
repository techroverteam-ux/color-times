import { z } from "zod";

export const bookingStatusSchema = z.object({
  status: z.enum(["inquiry", "pending_payment", "confirmed", "in_use", "returned", "cancelled"]),
  returnCondition: z.enum(["good", "minor_damage", "major_damage", "missing_items"]).optional(),
  returnNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;

export const bookingItemSchema = z.object({
  product: z.string().trim().min(1, "Dress is required"),
  size: z.string().trim().min(1, "Size is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export type BookingItemInput = z.infer<typeof bookingItemSchema>;

export const bookingCreateSchema = z
  .object({
    customer: z.string().trim().min(1, "Customer is required"),
    items: z.array(bookingItemSchema).min(1, "Add at least one item"),
    rentalStartDate: z.string().trim().min(1, "Rental start date is required"),
    rentalEndDate: z.string().trim().min(1, "Rental end date is required"),
    eventDate: z.string().trim().min(1, "Event date is required"),
    deliveryAddress: z.string().trim().min(1, "Delivery address is required"),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.rentalEndDate) >= new Date(data.rentalStartDate), {
    message: "Rental end date must be on or after the start date",
    path: ["rentalEndDate"],
  });

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
