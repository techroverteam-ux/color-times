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
      <div className="flex h-16 items-center gap-3 border-b border-ivory/10 px-6">
        <Image
          src="/logo-icon.png"
          alt={siteConfig.name}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <div className="leading-tight">
          <p className="font-heading text-base">{siteConfig.shortName}</p>
          <p className="text-[10px] uppercase tracking-wider text-ivory/50">Admin</p>
        </div>
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
