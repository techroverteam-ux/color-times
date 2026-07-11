import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { MANAGER_ROLES } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { STAFF_ROLES } from "@/lib/validations/staff";
import { UsersClient } from "@/components/admin/users-client";

export const metadata: Metadata = { title: "Team" };

export default async function AdminUsersPage() {
  const currentUser = await requireRole(MANAGER_ROLES);
  if (!currentUser) {
    redirect("/admin");
  }

  await connectToDatabase();
  const users = await User.find({ role: { $in: STAFF_ROLES } })
    .select("name email phone role isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const initialUsers = users.map((user) => ({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }));

  return <UsersClient initialUsers={initialUsers} currentUserId={currentUser.sub} currentUserRole={currentUser.role} />;
}
