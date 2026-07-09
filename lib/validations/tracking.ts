import { z } from "zod";

export const trackingSchema = z.object({
  bookingNumber: z.string().trim().min(4, "Enter a valid booking number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export type TrackingInput = z.infer<typeof trackingSchema>;
