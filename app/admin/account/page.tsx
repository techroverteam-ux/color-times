import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { AccountSettingsClient } from "@/components/admin/account-settings-client";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AdminAccountPage() {
  const currentUser = await requireRole(ADMIN_ROLES);
  if (!currentUser) {
    redirect("/login?next=/admin/account");
  }

  await connectToDatabase();
  const user = await User.findById(currentUser.sub).select("name email phone role").lean();
  if (!user) {
    redirect("/admin");
  }

  return (
    <AccountSettingsClient
      initialProfile={{
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
      }}
    />
  );
}
