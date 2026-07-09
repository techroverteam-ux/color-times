import { z } from "zod";

export const inventorySettingsSchema = z.object({
  lowStockThreshold: z.number().int().min(0).max(1000),
  skuPrefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,10}$/, "Use 2-10 uppercase letters, numbers, or hyphens"),
  defaultSecurityDepositMultiplier: z.number().min(1).max(10),
  defaultRetailValueMultiplier: z.number().min(1).max(50),
  autoArchiveOutOfStock: z.boolean(),
});

export type InventorySettingsInput = z.infer<typeof inventorySettingsSchema>;

export const DEFAULT_INVENTORY_SETTINGS: InventorySettingsInput = {
  lowStockThreshold: 3,
  skuPrefix: "CTB",
  defaultSecurityDepositMultiplier: 2,
  defaultRetailValueMultiplier: 12,
  autoArchiveOutOfStock: false,
};
