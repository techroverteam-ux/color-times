import type { UserRole } from "@/models/User";

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
}
