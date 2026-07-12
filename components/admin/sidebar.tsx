"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { AdminNavLinks } from "@/components/admin/nav-links";
import type { UserRole } from "@/models/User";

export function AdminSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:text-foreground">
      <div className="flex h-20 items-center justify-center border-b border-border px-6">
        <Image
          src="/logo-icon.png"
          alt={siteConfig.name}
          width={72}
          height={72}
          className="h-[72px] w-[72px] object-contain"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AdminNavLinks role={role} />
      </div>

      <div className="border-t border-border p-4">
        <Link
          href="/home"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          View Website
        </Link>
      </div>
    </aside>
  );
}
