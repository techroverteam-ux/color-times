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

export const customerCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  fatherName: z.string().trim().optional().or(z.literal("")),
  addressLine1: z.string().trim().optional().or(z.literal("")),
  addressCity: z.string().trim().optional().or(z.literal("")),
  addressState: z.string().trim().optional().or(z.literal("")),
  addressPostalCode: z.string().trim().optional().or(z.literal("")),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
