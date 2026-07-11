import type { UserRole } from "@/models/User";

export const ADMIN_ROLES: UserRole[] = ["staff", "admin", "super_admin"];
export const DEVELOPER_ROLES: UserRole[] = ["developer", "super_admin"];
export const MANAGER_ROLES: UserRole[] = ["admin", "super_admin"];
