import { z } from "zod";

export const whatsAppSettingsSchema = z.object({
  enabled: z.boolean(),
  senderLabel: z.string().trim().max(60),
  autoSendOnBookingConfirmed: z.boolean(),
  autoSendOnBookingReturned: z.boolean(),
  autoSendOnBookingCancelled: z.boolean(),
  autoSendOnInvoiceSent: z.boolean(),
  autoSendOnPaymentReceived: z.boolean(),
  autoSendOnCustomisationBillSent: z.boolean(),
  autoSendOnSaleBillSent: z.boolean(),
});

export type WhatsAppSettingsInput = z.infer<typeof whatsAppSettingsSchema>;

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettingsInput = {
  enabled: false,
  senderLabel: "",
  autoSendOnBookingConfirmed: true,
  autoSendOnBookingReturned: true,
  autoSendOnBookingCancelled: true,
  autoSendOnInvoiceSent: true,
  autoSendOnPaymentReceived: true,
  autoSendOnCustomisationBillSent: true,
  autoSendOnSaleBillSent: true,
};
