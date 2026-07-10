import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Booking, type BookingStatus } from "@/models/Booking";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { CustomerDetailClient } from "@/components/admin/customer-detail-client";
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
    User.findById(id).select("name email phone fatherName addresses createdAt").lean(),
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

      <CustomerDetailClient
        initialCustomer={{
          _id: String(customer._id),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          fatherName: customer.fatherName,
          createdAt: customer.createdAt.toISOString(),
          addresses: customer.addresses.map((address) => ({
            line1: address.line1,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
          })),
        }}
      />

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
