import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  CalendarCheck,
  Users,
  Receipt,
  MessageCircle,
  Sparkles,
  BarChart3,
  UserCog,
} from "lucide-react";
import { MANAGER_ROLES } from "@/lib/auth/roles";
import type { UserRole } from "@/models/User";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

const NAV_GROUPS_BY_ROLE: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Inventory",
    items: [
      { label: "Products", href: "/admin/products", icon: Shirt },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    label: "Rentals",
    items: [
      { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Dry Clean & Tailor", href: "/admin/services", icon: Sparkles },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Invoices", href: "/admin/invoices", icon: Receipt },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Team", href: "/admin/users", icon: UserCog, roles: MANAGER_ROLES },
    ],
  },
  {
    label: "Marketing",
    items: [{ label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle }],
  },
];

export const adminNavItems: AdminNavItem[] = NAV_GROUPS_BY_ROLE.flatMap((group) => group.items);

export function navItemsForRole(role: UserRole): AdminNavItem[] {
  return adminNavItems.filter((item) => !item.roles || item.roles.includes(role));
}

export function groupedNavItemsForRole(role: UserRole): AdminNavGroup[] {
  return NAV_GROUPS_BY_ROLE.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

const MOBILE_BOTTOM_NAV_HREFS = ["/admin", "/admin/products", "/admin/bookings", "/admin/invoices", "/admin/customers"];

export const mobileBottomNavItems: AdminNavItem[] = MOBILE_BOTTOM_NAV_HREFS.map(
  (href) => adminNavItems.find((item) => item.href === href)!
);
