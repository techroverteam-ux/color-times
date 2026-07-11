import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireApiRole } from "@/lib/api/require-role";
import { MANAGER_ROLES } from "@/lib/auth/roles";
import { createStaffSchema, STAFF_ROLES } from "@/lib/validations/staff";
import { hashPassword } from "@/lib/auth/password";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(MANAGER_ROLES);
  if ("error" in auth) return auth.error;

  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.trim();
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = { role: { $in: STAFF_ROLES } };
  if (role && (STAFF_ROLES as readonly string[]).includes(role)) {
    filter.role = role;
  }
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("name email phone role isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return apiSuccess({ users });
}

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(MANAGER_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const input = createStaffSchema.parse(body);

    if (
      (input.role === "super_admin" || input.role === "developer") &&
      auth.user.role !== "super_admin"
    ) {
      return apiError("Only a super admin can assign this role", 403);
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: input.email }).lean();
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const user = await User.create({
      name: input.name,
      email: input.email,
      phone: input.phone || undefined,
      passwordHash,
      role: input.role,
      isEmailVerified: true,
      isActive: true,
    });

    await recordAuditLog({
      entityType: "User",
      entityId: user._id,
      action: "create",
      actor: auth.user,
      metadata: { name: user.name, email: user.email, role: user.role },
    });

    return apiSuccess(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        temporaryPassword,
      },
      201
    );
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
