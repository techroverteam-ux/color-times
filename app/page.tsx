import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(ADMIN_ROLES.includes(user.role) ? "/admin" : "/home");
  }

  redirect("/login");
}
