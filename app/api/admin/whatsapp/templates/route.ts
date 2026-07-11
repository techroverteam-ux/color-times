import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { WhatsAppTemplate } from "@/models/WhatsAppTemplate";
import { whatsAppTemplateSchema } from "@/lib/validations/whatsapp-template";
import { requireApiRole } from "@/lib/api/require-role";
import { SETTINGS_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiErrorFromUnknown } from "@/lib/api/response";

export async function GET(): Promise<Response> {
  const auth = await requireApiRole(SETTINGS_ROLES);
  if ("error" in auth) return auth.error;

  await connectToDatabase();
  const templates = await WhatsAppTemplate.find().sort({ triggerEvent: 1, createdAt: -1 }).lean();

  return apiSuccess({ templates });
}

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(SETTINGS_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const input = whatsAppTemplateSchema.parse(body);

    await connectToDatabase();

    if (input.isActive) {
      await WhatsAppTemplate.updateMany(
        { triggerEvent: input.triggerEvent },
        { isActive: false }
      );
    }

    const template = await WhatsAppTemplate.create(input);

    await recordAuditLog({
      entityType: "WhatsAppTemplate",
      entityId: String(template._id),
      action: "create",
      actor: auth.user,
      snapshot: template.toObject() as unknown as Record<string, unknown>,
    });

    return apiSuccess({ template }, 201);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
