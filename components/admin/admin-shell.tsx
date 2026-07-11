import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminBottomNav } from "@/components/admin/bottom-nav";
import { AdminFooter } from "@/components/admin/admin-footer";
import { AdminThemeProvider } from "@/components/admin/theme-provider";
import type { SessionUser } from "@/types/auth";

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <div className="flex min-h-screen bg-secondary/30">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar user={user} />
          <main className="flex-1 overflow-x-hidden p-4 pb-4 lg:p-8">{children}</main>
          <div className="pb-20 lg:pb-0">
            <AdminFooter />
          </div>
        </div>
        <AdminBottomNav />
      </div>
    </AdminThemeProvider>
  );
}
