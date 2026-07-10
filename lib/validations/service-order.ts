import { z } from "zod";

export const serviceOrderSchema = z.object({
  serviceType: z.enum(["dry_clean", "tailor"]),
  product: z.string().min(1, "Select a product"),
  booking: z.string().optional().nullable(),
  description: z.string().trim().min(1, "Description is required").max(500),
  cost: z.number().min(0),
  assignedTo: z.string().trim().optional(),
  sentDate: z.string().min(1, "Sent date is required"),
  expectedReturnDate: z.string().min(1, "Expected return date is required"),
  notes: z.string().trim().optional(),
});

export type ServiceOrderInput = z.infer<typeof serviceOrderSchema>;

export const serviceOrderStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "quality_check", "completed", "cancelled"]),
});

export const serviceOrderUpdateSchema = serviceOrderSchema.partial().extend({
  status: z.enum(["pending", "in_progress", "quality_check", "completed", "cancelled"]).optional(),
});

export type ServiceOrderUpdateInput = z.infer<typeof serviceOrderUpdateSchema>;
