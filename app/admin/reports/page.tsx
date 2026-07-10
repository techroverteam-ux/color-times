import type { Metadata } from "next";
import { ReportsClient } from "@/components/admin/reports-client";

export const metadata: Metadata = { title: "Reports" };

export default function AdminReportsPage() {
  return <ReportsClient />;
}
