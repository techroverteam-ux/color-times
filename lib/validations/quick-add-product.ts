import { z } from "zod";

export const quickAddProductSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  category: z.string().trim().min(1, "Category is required"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "Custom"]),
  quantityInStock: z.number().int().min(0),
  rentalPricePerDay: z.number().min(0),
  image: z.string().trim().min(1, "An image is required"),
});

export type QuickAddProductInput = z.infer<typeof quickAddProductSchema>;
