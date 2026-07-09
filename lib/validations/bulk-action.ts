import { z } from "zod";

export const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, "Select at least one item"),
  action: z.enum(["archive", "restore", "delete", "permanent-delete", "activate", "deactivate"]),
});

export type BulkActionInput = z.infer<typeof bulkActionSchema>;
