"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { AdminNavLinks } from "@/components/admin/nav-links";
import type { UserRole } from "@/models/User";

export function AdminSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-ivory/10 lg:bg-charcoal lg:text-ivory">
      <div className="flex h-16 items-center justify-center border-b border-ivory/10 px-6">
        <Image
          src="/logo-icon.png"
          alt={siteConfig.name}
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AdminNavLinks role={role} tone="dark" />
      </div>

      <div className="border-t border-ivory/10 p-4">
        <Link
          href="/home"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-ivory/50 hover:text-ivory/80"
        >
          <ExternalLink className="h-3 w-3" />
          View Website
        </Link>
      </div>
    </aside>
  );
}
