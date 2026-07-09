import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { categorySchema } from "@/lib/validations/category";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
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
    const input = categorySchema.partial().parse(body);

    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(id, input, { returnDocument: "after" });

    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiSuccess({ category });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    return apiError(
      `Cannot delete this category — ${productCount} product(s) still reference it`,
      409
    );
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return apiError("Category not found", 404);
  }

  return apiSuccess({ deleted: true });
}
