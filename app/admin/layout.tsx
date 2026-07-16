import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_THEME_COOKIE_KEY } from "@/lib/admin/theme-cookie";

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

  const cookieStore = await cookies();
  const initialTheme = cookieStore.get(ADMIN_THEME_COOKIE_KEY)?.value === "dark" ? "dark" : "light";

  return (
    <AdminShell user={user} initialTheme={initialTheme}>
      {children}
    </AdminShell>
  );
}
