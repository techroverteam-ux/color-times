import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  CalendarCheck,
  Users,
  Receipt,
  MessageCircle,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Shirt },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Invoices", href: "/admin/invoices", icon: Receipt },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
];

const MOBILE_BOTTOM_NAV_HREFS = ["/admin", "/admin/products", "/admin/bookings", "/admin/invoices", "/admin/customers"];

export const mobileBottomNavItems: AdminNavItem[] = MOBILE_BOTTOM_NAV_HREFS.map(
  (href) => adminNavItems.find((item) => item.href === href)!
);
