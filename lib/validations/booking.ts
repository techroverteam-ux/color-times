import { z } from "zod";

export const bookingStatusSchema = z.object({
  status: z.enum(["inquiry", "pending_payment", "confirmed", "in_use", "returned", "cancelled"]),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
