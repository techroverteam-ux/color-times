import Link from "next/link";
import {
  IndianRupee,
  CalendarCheck,
  Users,
  Shirt,
  ArrowUpRight,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { getDashboardStats } from "@/lib/admin/dashboard-stats";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { DashboardAnalyticsPanel } from "@/components/admin/dashboard-analytics-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BookingStatus } from "@/models/Booking";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
            icon={IndianRupee}
            hint="Confirmed, in-use & returned bookings"
          />
          <StatCard
            label="Outstanding Balance"
            value={`₹${stats.outstandingBalance.toLocaleString("en-IN")}`}
            icon={Receipt}
            hint="Unpaid on sent invoices"
          />
          <StatCard
            label="Returns Due"
            value={stats.returnsDue.toLocaleString("en-IN")}
            icon={RotateCcw}
            hint="Rentals past their return date"
          />
          <StatCard
            label="Total Bookings"
            value={stats.totalBookings.toLocaleString("en-IN")}
            icon={CalendarCheck}
          />
          <StatCard
            label="Active Rentals"
            value={stats.activeRentals.toLocaleString("en-IN")}
            icon={Shirt}
            hint="Currently out with customers"
          />
          <StatCard
            label="Customers"
            value={stats.totalCustomers.toLocaleString("en-IN")}
            icon={Users}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg">Revenue, Last 6 Months</h2>
            </div>
            <div className="mt-4">
              <RevenueChart data={stats.monthlyRevenue} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-lg">Recent Bookings</h2>
            <div className="mt-4 space-y-4">
              {stats.recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                stats.recentBookings.map((booking) => (
                  <div key={booking._id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {booking.customer?.name ?? "Unknown customer"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {booking.productSummary}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status as BookingStatus} />
                  </div>
                ))
              )}
            </div>
            <Link
              href="/admin/bookings"
              className="mt-5 flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View all bookings <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <DashboardAnalyticsPanel />
      </TabsContent>
    </Tabs>
  );
}
