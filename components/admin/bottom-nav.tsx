"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBottomNavItems } from "@/lib/config/admin-nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      {mobileBottomNavItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px]",
              active ? "text-accent" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
