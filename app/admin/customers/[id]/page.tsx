import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Booking, type BookingStatus } from "@/models/Booking";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Customer Detail" };

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();

  const [customer, bookings] = await Promise.all([
    User.findById(id).select("name email phone addresses createdAt").lean(),
    Booking.find({ customer: id }).populate("product", "name").sort({ createdAt: -1 }).lean(),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="font-heading text-2xl">{customer.name}</h1>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Email</p>
            <p className="mt-1">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Phone</p>
            <p className="mt-1">{customer.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Joined</p>
            <p className="mt-1">{new Date(customer.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg">Booking History</h2>
        <div className="mt-4">
          {bookings.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No bookings yet"
              description="This customer hasn't made any bookings."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Booking #</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={String(booking._id)} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{booking.bookingNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(booking.product as unknown as { name: string } | null)?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        &#8377;{booking.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={booking.status as BookingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
