import "server-only";
import { siteConfig } from "@/lib/config/site";

const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { success: false, error: "BREVO_API_KEY is not configured" };
  }

  try {
    const response = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: siteConfig.name, email: siteConfig.contact.email },
        to: [{ email: params.to, name: params.toName ?? params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
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
