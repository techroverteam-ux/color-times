import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await connectToDatabase();

    const original = await Product.findById(id).lean();
    if (!original) {
      return apiError("Product not found", 404);
    }

    const suffix = Date.now().toString().slice(-6);

    const duplicate = await Product.create({
      ...original,
      _id: undefined,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${suffix}`,
      sku: `${original.sku}-C${suffix}`,
      isActive: false,
      isFeatured: false,
      averageRating: 0,
      reviewCount: 0,
      archivedAt: null,
      deletedAt: null,
    });

    await recordAuditLog({
      entityType: "Product",
      entityId: String(duplicate._id),
      action: "create",
      actor: auth.user,
      snapshot: duplicate.toObject() as unknown as Record<string, unknown>,
      metadata: { duplicatedFrom: id },
    });

    return apiSuccess({ product: duplicate }, 201);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
