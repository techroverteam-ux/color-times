import "server-only";

const BREVO_WHATSAPP_ENDPOINT = "https://api.brevo.com/v3/whatsapp/sendMessage";

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

function normalizePhoneNumber(phone: string): number {
  const digitsOnly = phone.replace(/\D/g, "");
  return Number(digitsOnly);
}

interface SendWhatsAppMessageParams {
  to: string;
  senderNumber: string;
  templateId: number;
}

interface SendWhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  params: SendWhatsAppMessageParams
): Promise<SendWhatsAppMessageResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { success: false, error: "BREVO_API_KEY is not configured" };
  }

  try {
    const response = await fetch(BREVO_WHATSAPP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        contactNumbers: [normalizePhoneNumber(params.to)],
        senderNumber: normalizePhoneNumber(params.senderNumber).toString(),
        templateId: params.templateId,
      }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error =
        typeof json?.message === "string" ? json.message : `Brevo API error (${response.status})`;
      return { success: false, error };
    }

    return { success: true, messageId: json?.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reach Brevo API",
    };
  }
}
