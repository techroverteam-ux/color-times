"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BookingStatus } from "@/models/Booking";
import type { InvoiceStatus } from "@/models/Invoice";

interface DashboardAnalyticsProps {
  bookingStatusBreakdown: { status: BookingStatus; count: number }[];
  invoiceStatusBreakdown: { status: InvoiceStatus; count: number; total: number }[];
  categoryRevenue: { category: string; revenue: number; bookings: number }[];
  topProducts: { name: string; bookings: number; revenue: number }[];
  monthlyTrend: { label: string; revenue: number; bookings: number; newCustomers: number }[];
}

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  inquiry: "#94a3b8",
  pending_payment: "#f59e0b",
  confirmed: "#3b82f6",
  in_use: "#10b981",
  returned: "#64748b",
  cancelled: "#ef4444",
};

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  inquiry: "Inquiry",
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  in_use: "In Use",
  returned: "Returned",
  cancelled: "Cancelled",
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "#94a3b8",
  sent: "#3b82f6",
  partially_paid: "#f59e0b",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#64748b",
};

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  fontSize: 13,
};

const axisTick = { fontSize: 12, fill: "var(--muted-foreground)" };

export function DashboardAnalytics({
  bookingStatusBreakdown,
  invoiceStatusBreakdown,
  categoryRevenue,
  topProducts,
  monthlyTrend,
}: DashboardAnalyticsProps) {
  const bookingPieData = bookingStatusBreakdown
    .filter((entry) => entry.count > 0)
    .map((entry) => ({ name: BOOKING_STATUS_LABELS[entry.status], value: entry.count, status: entry.status }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-lg">Booking Status Distribution</h2>
          <p className="mt-1 text-sm text-muted-foreground">All bookings, all-time</p>
          <div className="mt-4">
            {bookingPieData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No bookings yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={bookingPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {bookingPieData.map((entry) => (
                      <Cell key={entry.status} fill={BOOKING_STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [String(value), "Bookings"]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-lg">Invoice Status Breakdown</h2>
          <p className="mt-1 text-sm text-muted-foreground">Count of invoices by status</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={invoiceStatusBreakdown} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="status"
                  tickFormatter={(value: InvoiceStatus) => INVOICE_STATUS_LABELS[value]}
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name, item) => [
                    `${value} invoice(s) · ${formatCurrency(item.payload.total)}`,
                    INVOICE_STATUS_LABELS[item.payload.status as InvoiceStatus],
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {invoiceStatusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={INVOICE_STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-lg">Revenue by Category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Confirmed, in-use &amp; returned bookings</p>
          <div className="mt-4">
            {categoryRevenue.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No category revenue yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={categoryRevenue}
                  layout="vertical"
                  margin={{ top: 10, right: 24, left: 12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                    tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="var(--gold)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-lg">Top 5 Dresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">By number of bookings</p>
          <div className="mt-4">
            {topProducts.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No bookings yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 10, right: 24, left: 12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name, item) => [
                      `${value} booking(s) · ${formatCurrency(item.payload.revenue)}`,
                      "Bookings",
                    ]}
                  />
                  <Bar dataKey="bookings" fill="var(--gold)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-lg">Monthly Trend</h2>
        <p className="mt-1 text-sm text-muted-foreground">Last 12 months</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm whitespace-nowrap">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Month</th>
                <th className="px-3 py-2 text-right">Bookings</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right">New Customers</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    No data yet.
                  </td>
                </tr>
              ) : (
                monthlyTrend.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium">{row.label}</td>
                    <td className="px-3 py-2 text-right">{row.bookings}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.revenue)}</td>
                    <td className="px-3 py-2 text-right">{row.newCustomers}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
