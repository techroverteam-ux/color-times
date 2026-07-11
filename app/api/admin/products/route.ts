import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import "@/models/Category";
import { productSchema } from "@/lib/validations/product";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

const SORTABLE_FIELDS = new Set([
  "name",
  "sku",
  "rentalPricePerDay",
  "createdAt",
  "updatedAt",
]);

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const all = searchParams.get("all") === "true";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category");
  const status = searchParams.get("status") ?? "active";
  const sortField = searchParams.get("sortBy") ?? "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;

  const filter: Record<string, unknown> = {};

  if (status === "trash") {
    filter.deletedAt = { $ne: null };
  } else if (status === "archived") {
    filter.deletedAt = null;
    filter.archivedAt = { $ne: null };
  } else {
    // "active" and "all" both exclude trashed items; "all" includes archived
    filter.deletedAt = null;
    if (status === "active") {
      filter.archivedAt = null;
    }
  }

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category;
  }

  const sort: Record<string, 1 | -1> = {
    [SORTABLE_FIELDS.has(sortField) ? sortField : "createdAt"]: sortDir,
  };

  const baseQuery = Product.find(filter).populate("category", "name slug").sort(sort);

  const [products, total] = await Promise.all([
    all ? baseQuery.lean() : baseQuery.skip((page - 1) * pageSize).limit(pageSize).lean(),
    Product.countDocuments(filter),
  ]);

  return apiSuccess({
    products,
    pagination: all
      ? { page: 1, pageSize: total || 1, total, totalPages: 1 }
      : { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const input = productSchema.parse(body);

    await connectToDatabase();

    const existing = await Product.findOne({
      $or: [{ slug: input.slug }, { sku: input.sku }],
    }).lean();
    if (existing) {
      return apiError("A product with this slug or SKU already exists", 409);
    }

    const product = await Product.create(input);

    await recordAuditLog({
      entityType: "Product",
      entityId: String(product._id),
      action: "create",
      actor: auth.user,
      snapshot: product.toObject() as unknown as Record<string, unknown>,
    });

    return apiSuccess({ product }, 201);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
