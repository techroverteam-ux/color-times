import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500),
  heroImage: z.string().trim().min(1, "Hero image is required"),
  displayOrder: z.number().int().min(0),
  isFeatured: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
