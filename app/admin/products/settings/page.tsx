import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { SETTINGS_ROLES } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db/connect";
import { Settings } from "@/models/Settings";
import { InventorySettingsForm } from "@/components/admin/inventory-settings-form";
import { DEFAULT_INVENTORY_SETTINGS } from "@/lib/validations/inventory-settings";

export const metadata: Metadata = { title: "Inventory Settings" };

export default async function InventorySettingsPage() {
  const currentUser = await requireRole(SETTINGS_ROLES);
  if (!currentUser) {
    redirect("/admin");
  }

  await connectToDatabase();
  const settings = await Settings.findOne({ module: "inventory" }).lean();

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div>
        <h1 className="font-heading text-2xl">Inventory Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure defaults used across product creation and stock management.
        </p>
      </div>

      <InventorySettingsForm
        initialSettings={
          (settings?.data as typeof DEFAULT_INVENTORY_SETTINGS) ?? DEFAULT_INVENTORY_SETTINGS
        }
      />
    </div>
  );
}
