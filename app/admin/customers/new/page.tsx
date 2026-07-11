import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "@/components/admin/customer-form";

export const metadata: Metadata = { title: "New Customer" };

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div>
        <h1 className="font-heading text-2xl">New Customer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a customer profile before creating a booking for them.
        </p>
      </div>

      <CustomerForm />
    </div>
  );
}
