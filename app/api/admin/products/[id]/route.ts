import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations/product";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog, diffObjects } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const product = await Product.findById(id).populate("category", "name slug").lean();
  if (!product) {
    return apiError("Product not found", 404);
  }

  return apiSuccess({ product });
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const input = productSchema.partial().parse(body);

    await connectToDatabase();

    const before = await Product.findById(id).lean();
    if (!before) {
      return apiError("Product not found", 404);
    }

    const product = await Product.findByIdAndUpdate(id, input, { returnDocument: "after" });
    if (!product) {
      return apiError("Product not found", 404);
    }

    const changes = diffObjects(
      before as unknown as Record<string, unknown>,
      product.toObject() as unknown as Record<string, unknown>
    );

    if (changes.length > 0) {
      await recordAuditLog({
        entityType: "Product",
        entityId: id,
        action: "update",
        actor: auth.user,
        changes,
      });
    }

    return apiSuccess({ product });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const product = await Product.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { returnDocument: "after" }
  );

  if (!product) {
    return apiError("Product not found", 404);
  }

  await recordAuditLog({
    entityType: "Product",
    entityId: id,
    action: "delete",
    actor: auth.user,
    snapshot: product.toObject() as unknown as Record<string, unknown>,
  });

  return apiSuccess({ deleted: true });
}
