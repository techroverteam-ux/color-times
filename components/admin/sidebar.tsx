"use client";

import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { AdminNavLinks } from "@/components/admin/nav-links";
import { VisitWebsiteLink } from "@/components/admin/visit-website-link";
import type { UserRole } from "@/models/User";

export function AdminSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:text-foreground">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-border px-6">
        <Image
          src="/logo-icon.png"
          alt={siteConfig.name}
          width={44}
          height={44}
          className="h-11 w-11 object-contain"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AdminNavLinks role={role} />
      </div>

      <div className="border-t border-border p-4">
        <VisitWebsiteLink />
      </div>
    </aside>
  );
}
