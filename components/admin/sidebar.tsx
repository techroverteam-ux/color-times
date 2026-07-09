"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/config/admin-nav";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-ivory/10 lg:bg-charcoal lg:text-ivory">
      <div className="flex h-16 items-center gap-3 border-b border-ivory/10 px-6">
        <Image
          src="/images/placeholder/brand/logo.png"
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

      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ivory/10 text-gold"
                  : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ivory/10 p-4">
        <Link
          href="/"
          className="block text-xs text-ivory/50 hover:text-ivory/80"
        >
          &larr; Back to public site
        </Link>
      </div>
    </aside>
  );
}
