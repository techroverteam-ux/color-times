import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "Custom"]),
  quantityInStock: z.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  sku: z.string().trim().toUpperCase().min(3, "SKU must be at least 3 characters"),
  category: z.string().trim().min(1, "Category is required"),
  designer: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  color: z.string().trim().min(2, "Color is required"),
  fabric: z.string().trim().min(2, "Fabric is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  variants: z.array(productVariantSchema).min(1, "At least one size variant is required"),
  status: z
    .enum(["available", "booked", "under_dry_cleaning", "under_repair", "returned"])
    .optional(),
  rentalPricePerDay: z.number().min(0),
  retailValue: z.number().min(0),
  securityDeposit: z.number().min(0),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isActive: z.boolean(),
  tags: z.array(z.string()),
});

export type ProductInput = z.infer<typeof productSchema>;
