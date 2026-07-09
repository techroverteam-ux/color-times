import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Color Times Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(ADMIN_ROLES);

  if (!user) {
    redirect("/login?next=/admin");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
