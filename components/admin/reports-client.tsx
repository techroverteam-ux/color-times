"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/admin/stat-card";
import { downloadCsv, downloadPdf } from "@/lib/admin/export";
import { DATE_RANGE_PRESETS, DATE_RANGE_LABELS, type DateRangePreset } from "@/lib/admin/date-ranges";
import { formatDate } from "@/lib/utils";

type ReportType = "products" | "bookings" | "invoices" | "customers" | "services";
type Row = Record<string, string | number | boolean>;

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: "products", label: "Products" },
  { value: "bookings", label: "Bookings" },
  { value: "invoices", label: "Invoices" },
  { value: "customers", label: "Customers" },
  { value: "services", label: "Dry Clean & Tailor" },
];

const STATUS_OPTIONS: Record<ReportType, { value: string; label: string }[]> = {
  products: [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "trash", label: "Trash" },
  ],
  bookings: [
    { value: "all", label: "All" },
    { value: "inquiry", label: "Inquiry" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_use", label: "In Use" },
    { value: "returned", label: "Returned" },
    { value: "cancelled", label: "Cancelled" },
  ],
  invoices: [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ],
  customers: [],
  services: [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "quality_check", label: "Quality Check" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ],
};

const SERVICE_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "dry_clean", label: "Dry Clean" },
  { value: "tailor", label: "Tailor / Alteration" },
];

interface ColumnConfig {
  key: string;
  label: string;
  format?: (row: Row) => string;
}

const CURRENCY = (value: unknown) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
const DATE = (value: unknown) => formatDate(String(value));

const TABLE_CONFIGS: Record<ReportType, ColumnConfig[]> = {
  products: [
    { key: "name", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "rentalPricePerDay", label: "Price/Day", format: (r) => CURRENCY(r.rentalPricePerDay) },
    { key: "retailValue", label: "Retail Value", format: (r) => CURRENCY(r.retailValue) },
    { key: "totalStock", label: "Stock" },
    { key: "isActive", label: "Status", format: (r) => (r.isActive ? "Active" : "Inactive") },
    { key: "createdAt", label: "Added", format: (r) => DATE(r.createdAt) },
  ],
  bookings: [
    { key: "bookingNumber", label: "Booking #" },
    { key: "customer", label: "Customer" },
    { key: "product", label: "Product" },
    { key: "status", label: "Status", format: (r) => String(r.status).replace("_", " ") },
    { key: "totalAmount", label: "Total", format: (r) => CURRENCY(r.totalAmount) },
    { key: "rentalStartDate", label: "Start", format: (r) => DATE(r.rentalStartDate) },
    { key: "rentalEndDate", label: "End", format: (r) => DATE(r.rentalEndDate) },
    { key: "createdAt", label: "Created", format: (r) => DATE(r.createdAt) },
  ],
  invoices: [
    { key: "invoiceNumber", label: "Invoice #" },
    { key: "customer", label: "Customer" },
    { key: "status", label: "Status", format: (r) => String(r.status).replace("_", " ") },
    { key: "total", label: "Total", format: (r) => CURRENCY(r.total) },
    { key: "amountPaid", label: "Paid", format: (r) => CURRENCY(r.amountPaid) },
    { key: "amountDue", label: "Due", format: (r) => CURRENCY(r.amountDue) },
    { key: "dueDate", label: "Due Date", format: (r) => DATE(r.dueDate) },
    { key: "createdAt", label: "Created", format: (r) => DATE(r.createdAt) },
  ],
  customers: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Mobile" },
    { key: "fatherName", label: "Father's Name" },
    { key: "createdAt", label: "Joined", format: (r) => DATE(r.createdAt) },
  ],
  services: [
    { key: "product", label: "Product" },
    {
      key: "serviceType",
      label: "Type",
      format: (r) => (r.serviceType === "dry_clean" ? "Dry Clean" : "Tailor / Alteration"),
    },
    { key: "description", label: "Description" },
    { key: "cost", label: "Cost", format: (r) => CURRENCY(r.cost) },
    { key: "status", label: "Status", format: (r) => String(r.status).replace("_", " ") },
    { key: "assignedTo", label: "Assigned To" },
    { key: "expectedReturnDate", label: "Expected Return", format: (r) => DATE(r.expectedReturnDate) },
  ],
};

interface SummaryCardConfig {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

const SUMMARY_CONFIGS: Record<ReportType, SummaryCardConfig[]> = {
  products: [
    { key: "totalProducts", label: "Total Products" },
    { key: "activeCount", label: "Active Products" },
    { key: "totalStockUnits", label: "Total Stock Units" },
    { key: "totalStockValue", label: "Total Stock Value", format: CURRENCY },
  ],
  bookings: [
    { key: "totalBookings", label: "Total Bookings" },
    { key: "totalRevenue", label: "Total Revenue", format: CURRENCY },
    { key: "avgBookingValue", label: "Avg. Booking Value", format: CURRENCY },
    { key: "activeCount", label: "Currently In Use" },
  ],
  invoices: [
    { key: "totalInvoices", label: "Total Invoices" },
    { key: "totalInvoiced", label: "Total Invoiced", format: CURRENCY },
    { key: "totalCollected", label: "Total Collected", format: CURRENCY },
    { key: "totalOutstanding", label: "Outstanding", format: CURRENCY },
  ],
  customers: [
    { key: "newCustomers", label: "New Customers (in range)" },
    { key: "totalCustomersOverall", label: "Total Customers (all-time)" },
  ],
  services: [
    { key: "totalOrders", label: "Total Orders" },
    { key: "totalCost", label: "Total Cost", format: CURRENCY },
    { key: "completedCount", label: "Completed" },
    { key: "pendingCount", label: "Pending / In Progress" },
  ],
};

interface ReportData {
  summary: Record<string, number>;
  items: Row[];
  range: { from: string | null; to: string | null; label: string };
}

async function fetchReport(params: {
  type: ReportType;
  range: DateRangePreset;
  from: string;
  to: string;
  status: string;
  serviceType: string;
}): Promise<ReportData> {
  const searchParams = new URLSearchParams({ type: params.type, range: params.range });
  if (params.range === "custom") {
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
  }
  if (params.status !== "all") searchParams.set("status", params.status);
  if (params.serviceType !== "all") searchParams.set("serviceType", params.serviceType);

  const res = await fetch(`/api/admin/reports?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function ReportsClient() {
  const [reportType, setReportType] = useState<ReportType>("bookings");
  const [range, setRange] = useState<DateRangePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [status, setStatus] = useState("all");
  const [serviceType, setServiceType] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", { reportType, range, customFrom, customTo, status, serviceType }],
    queryFn: () =>
      fetchReport({
        type: reportType,
        range,
        from: customFrom,
        to: customTo,
        status,
        serviceType,
      }),
  });

  const columns = TABLE_CONFIGS[reportType];
  const summaryConfig = SUMMARY_CONFIGS[reportType];
  const statusOptions = STATUS_OPTIONS[reportType];

  function exportRows(): { headers: string[]; rows: (string | number)[][] } {
    const headers = columns.map((c) => c.label);
    const rows = (data?.items ?? []).map((row) =>
      columns.map((c) => (c.format ? c.format(row) : (row[c.key] as string | number)))
    );
    return { headers, rows };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filter, review, and export data across every module.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={reportType}
          onValueChange={(value) => {
            setReportType((value as ReportType) ?? "bookings");
            setStatus("all");
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue>
              {(value: ReportType) =>
                REPORT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={range} onValueChange={(value) => setRange((value as DateRangePreset) ?? "month")}>
          <SelectTrigger className="w-56">
            <SelectValue>
              {(value: DateRangePreset) => DATE_RANGE_LABELS[value] ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((preset) => (
              <SelectItem key={preset} value={preset}>
                {DATE_RANGE_LABELS[preset]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {range === "custom" && (
          <>
            <Input
              type="date"
              className="w-40"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              className="w-40"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </>
        )}

        {statusOptions.length > 0 && (
          <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {(value: string) => statusOptions.find((o) => o.value === value)?.label ?? value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {reportType === "services" && (
          <Select value={serviceType} onValueChange={(value) => setServiceType(value ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {(value: string) =>
                  SERVICE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { headers, rows } = exportRows();
              downloadCsv(`${reportType}-report`, headers, rows);
            }}
          >
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { headers, rows } = exportRows();
              downloadPdf(
                `${reportType}-report`,
                `${REPORT_TYPE_OPTIONS.find((o) => o.value === reportType)?.label} Report — ${data?.range.label ?? ""}`,
                headers,
                rows
              );
            }}
          >
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {data && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{data.range.label}</span> &middot;{" "}
          {data.items.length} records
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryConfig.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={
              card.format
                ? card.format(data?.summary[card.key] ?? 0)
                : (data?.summary[card.key] ?? 0).toLocaleString("en-IN")
            }
            icon={FileSpreadsheet}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading &&
              (data?.items ?? []).map((row, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.format ? column.format(row) : String(row[column.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  No records found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
