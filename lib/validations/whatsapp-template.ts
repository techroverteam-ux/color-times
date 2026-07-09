import { z } from "zod";
import { TRIGGER_EVENTS } from "@/lib/notifications/trigger-events";

export const whatsAppTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  triggerEvent: z.enum(TRIGGER_EVENTS),
  brevoTemplateId: z.number().int().positive("Enter the numeric Template ID from Brevo"),
  previewBody: z
    .string()
    .trim()
    .min(1, "Add a preview so staff know what this template says")
    .max(1000),
  isActive: z.boolean(),
});

export type WhatsAppTemplateInput = z.infer<typeof whatsAppTemplateSchema>;
