import { z } from "zod";

export const bookingStatusSchema = z.object({
  status: z.enum(["inquiry", "pending_payment", "confirmed", "in_use", "returned", "cancelled"]),
  returnCondition: z.enum(["good", "minor_damage", "major_damage", "missing_items"]).optional(),
  returnNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;

export const bookingCreateSchema = z
  .object({
    customer: z.string().trim().min(1, "Customer is required"),
    product: z.string().trim().min(1, "Dress is required"),
    size: z.string().trim().min(1, "Size is required"),
    rentalStartDate: z.string().trim().min(1, "Rental start date is required"),
    rentalEndDate: z.string().trim().min(1, "Rental end date is required"),
    eventDate: z.string().trim().min(1, "Event date is required"),
    rentalFee: z.number().min(0),
    securityDeposit: z.number().min(0),
    totalAmount: z.number().min(0),
    deliveryAddress: z.string().trim().min(1, "Delivery address is required"),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.rentalEndDate) >= new Date(data.rentalStartDate), {
    message: "Rental end date must be on or after the start date",
    path: ["rentalEndDate"],
  });

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
