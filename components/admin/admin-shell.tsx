import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminBottomNav } from "@/components/admin/bottom-nav";
import { AdminFooter } from "@/components/admin/admin-footer";
import { AdminThemeProvider } from "@/components/admin/theme-provider";
import { SessionRefresher } from "@/components/admin/session-refresher";
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
      <SessionRefresher />
      <div className="flex h-svh overflow-hidden bg-secondary/30">
        <AdminSidebar role={user.role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar user={user} />
          <main className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="flex-1 p-4 pb-4 lg:p-8">{children}</div>
            <div className="pb-20 lg:pb-0">
              <AdminFooter />
            </div>
          </main>
        </div>
        <AdminBottomNav />
      </div>
    </AdminThemeProvider>
  );
}
