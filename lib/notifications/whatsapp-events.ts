import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Settings } from "@/models/Settings";
import { WhatsAppTemplate, type WhatsAppTriggerEvent } from "@/models/WhatsAppTemplate";
import { NotificationLog } from "@/models/NotificationLog";
import { sendWhatsAppMessage } from "@/lib/notifications/brevo-whatsapp";
import { renderTemplate } from "@/lib/notifications/render-template";
import {
  DEFAULT_WHATSAPP_SETTINGS,
  type WhatsAppSettingsInput,
} from "@/lib/validations/whatsapp-settings";

const SETTINGS_MODULE = "whatsapp";

type AutoSendKey =
  | "autoSendOnBookingConfirmed"
  | "autoSendOnBookingReturned"
  | "autoSendOnBookingCancelled"
  | "autoSendOnInvoiceSent"
  | "autoSendOnPaymentReceived";

interface NotifyContext {
  customerName: string;
  customerPhone?: string;
  relatedEntityType: "Booking" | "Invoice";
  relatedEntityId: string;
  variables: Record<string, string>;
}

async function dispatchWhatsAppEvent(
  triggerEvent: WhatsAppTriggerEvent,
  autoSendKey: AutoSendKey,
  context: NotifyContext
): Promise<void> {
  try {
    await connectToDatabase();

    const settingsDoc = await Settings.findOne({ module: SETTINGS_MODULE }).lean();
    const settings = (settingsDoc?.data as WhatsAppSettingsInput) ?? DEFAULT_WHATSAPP_SETTINGS;

    if (!settings.enabled || !settings[autoSendKey]) return;

    const template = await WhatsAppTemplate.findOne({ triggerEvent, isActive: true }).lean();
    if (!template) return;

    const renderedPreview = renderTemplate(template.previewBody, {
      customerName: context.customerName,
      ...context.variables,
    });

    if (!context.customerPhone) {
      await NotificationLog.create({
        channel: "whatsapp",
        recipientName: context.customerName,
        templateId: template._id,
        templateName: template.name,
        triggerEvent,
        message: renderedPreview,
        status: "failed",
        errorMessage: "Customer has no phone number on file",
        relatedEntityType: context.relatedEntityType,
        relatedEntityId: context.relatedEntityId,
      });
      return;
    }

    const result = await sendWhatsAppMessage({
      to: context.customerPhone,
      senderNumber: settings.senderLabel,
      templateId: template.brevoTemplateId,
    });

    await NotificationLog.create({
      channel: "whatsapp",
      recipientPhone: context.customerPhone,
      recipientName: context.customerName,
      templateId: template._id,
      templateName: template.name,
      triggerEvent,
      message: renderedPreview,
      status: result.success ? "sent" : "failed",
      providerMessageId: result.messageId,
      errorMessage: result.error,
      relatedEntityType: context.relatedEntityType,
      relatedEntityId: context.relatedEntityId,
    });
  } catch {
    // Notifications must never break the calling request/route.
  }
}

export function notifyBookingConfirmed(context: NotifyContext): Promise<void> {
  return dispatchWhatsAppEvent("booking_confirmed", "autoSendOnBookingConfirmed", context);
}

export function notifyBookingReturned(context: NotifyContext): Promise<void> {
  return dispatchWhatsAppEvent("booking_returned", "autoSendOnBookingReturned", context);
}

export function notifyBookingCancelled(context: NotifyContext): Promise<void> {
  return dispatchWhatsAppEvent("booking_cancelled", "autoSendOnBookingCancelled", context);
}

export function notifyInvoiceSent(context: NotifyContext): Promise<void> {
  return dispatchWhatsAppEvent("invoice_sent", "autoSendOnInvoiceSent", context);
}

export function notifyPaymentReceived(context: NotifyContext): Promise<void> {
  return dispatchWhatsAppEvent("payment_received", "autoSendOnPaymentReceived", context);
}
