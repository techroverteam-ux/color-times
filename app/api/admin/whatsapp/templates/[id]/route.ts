import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { WhatsAppTemplate } from "@/models/WhatsAppTemplate";
import { whatsAppTemplateSchema } from "@/lib/validations/whatsapp-template";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog, diffObjects } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const input = whatsAppTemplateSchema.parse(body);

    await connectToDatabase();

    const before = await WhatsAppTemplate.findById(id).lean();
    if (!before) {
      return apiError("Template not found", 404);
    }

    if (input.isActive) {
      await WhatsAppTemplate.updateMany(
        { triggerEvent: input.triggerEvent, _id: { $ne: id } },
        { isActive: false }
      );
    }

    const template = await WhatsAppTemplate.findByIdAndUpdate(id, input, {
      returnDocument: "after",
    });

    if (!template) {
      return apiError("Template not found", 404);
    }

    const changes = diffObjects(
      before as unknown as Record<string, unknown>,
      template.toObject() as unknown as Record<string, unknown>
    );

    if (changes.length > 0) {
      await recordAuditLog({
        entityType: "WhatsAppTemplate",
        entityId: id,
        action: "update",
        actor: auth.user,
        changes,
      });
    }

    return apiSuccess({ template });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const template = await WhatsAppTemplate.findByIdAndDelete(id);
  if (!template) {
    return apiError("Template not found", 404);
  }

  await recordAuditLog({
    entityType: "WhatsAppTemplate",
    entityId: id,
    action: "delete",
    actor: auth.user,
    snapshot: template.toObject() as unknown as Record<string, unknown>,
  });

  return apiSuccess({ deleted: true });
}
