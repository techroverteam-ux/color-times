"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { groupedNavItemsForRole } from "@/lib/config/admin-nav";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/models/User";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminNavLinks({
  role,
  onNavigate,
  tone = "dark",
}: {
  role: UserRole;
  onNavigate?: () => void;
  tone?: "dark" | "light";
}) {
  const pathname = usePathname();
  const groups = groupedNavItemsForRole(role);

  return (
    <nav className="flex-1 space-y-5 px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p
            className={cn(
              "px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider",
              tone === "dark" ? "text-ivory/40" : "text-muted-foreground"
            )}
          >
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? tone === "dark"
                        ? "bg-ivory/10 font-medium text-gold"
                        : "bg-secondary font-medium text-accent-foreground"
                      : tone === "dark"
                        ? "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 h-5 w-[3px] rounded-full bg-gold transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
