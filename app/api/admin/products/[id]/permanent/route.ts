import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const product = await Product.findById(id).lean();
  if (!product) {
    return apiError("Product not found", 404);
  }

  if (!product.deletedAt) {
    return apiError("Move this product to trash before permanently deleting it", 409);
  }

  await Product.findByIdAndDelete(id);

  await recordAuditLog({
    entityType: "Product",
    entityId: id,
    action: "delete",
    actor: auth.user,
    snapshot: product as unknown as Record<string, unknown>,
    metadata: { permanent: true },
  });

  return apiSuccess({ deleted: true });
}
