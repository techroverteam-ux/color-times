import { z } from "zod";

export const customerUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().optional(),
  fatherName: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressCity: z.string().trim().optional(),
  addressState: z.string().trim().optional(),
  addressPostalCode: z.string().trim().optional(),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
