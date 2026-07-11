import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireApiRole } from "@/lib/api/require-role";
import { MANAGER_ROLES } from "@/lib/auth/roles";
import { updateStaffSchema, STAFF_ROLES } from "@/lib/validations/staff";
import { recordAuditLog, diffObjects } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(MANAGER_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const input = updateStaffSchema.parse(body);

    await connectToDatabase();

    const before = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } }).select(
      "name phone role isActive"
    );
    if (!before) {
      return apiError("Staff account not found", 404);
    }

    if (
      input.role &&
      (input.role === "super_admin" || input.role === "developer") &&
      auth.user.role !== "super_admin"
    ) {
      return apiError("Only a super admin can assign this role", 403);
    }

    if (id === auth.user.sub) {
      if (input.isActive === false) {
        return apiError("You cannot deactivate your own account", 400);
      }
      if (input.role && input.role !== before.role) {
        return apiError("You cannot change your own role", 400);
      }
    }

    if (
      before.role === "super_admin" &&
      (input.isActive === false || (input.role && input.role !== "super_admin"))
    ) {
      const remainingSuperAdmins = await User.countDocuments({
        role: "super_admin",
        isActive: true,
        _id: { $ne: id },
      });
      if (remainingSuperAdmins === 0) {
        return apiError("At least one active super admin must remain", 400);
      }
    }

    const beforeSnapshot = before.toObject() as unknown as Record<string, unknown>;

    if (input.name !== undefined) before.name = input.name;
    if (input.phone !== undefined) before.phone = input.phone || undefined;
    if (input.role !== undefined) before.role = input.role;
    if (input.isActive !== undefined) before.isActive = input.isActive;
    await before.save();

    const changes = diffObjects(
      beforeSnapshot,
      before.toObject() as unknown as Record<string, unknown>
    );

    if (changes.length > 0) {
      await recordAuditLog({
        entityType: "User",
        entityId: id,
        action: "update",
        actor: auth.user,
        changes,
      });
    }

    return apiSuccess({
      user: {
        _id: before._id,
        name: before.name,
        email: before.email,
        phone: before.phone,
        role: before.role,
        isActive: before.isActive,
      },
    });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(MANAGER_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  if (id === auth.user.sub) {
    return apiError("You cannot delete your own account", 400);
  }

  await connectToDatabase();

  const target = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } }).select("role");
  if (!target) {
    return apiError("Staff account not found", 404);
  }

  if (target.role === "super_admin") {
    const remainingSuperAdmins = await User.countDocuments({
      role: "super_admin",
      _id: { $ne: id },
    });
    if (remainingSuperAdmins === 0) {
      return apiError("At least one super admin must remain", 400);
    }
  }

  await User.deleteOne({ _id: id });

  await recordAuditLog({
    entityType: "User",
    entityId: id,
    action: "delete",
    actor: auth.user,
  });

  return apiSuccess({ deleted: true });
}
