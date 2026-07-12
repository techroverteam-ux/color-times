"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileDown,
  Grid3x3,
  List,
  MoreHorizontal,
  Printer,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "@/components/admin/invoice-status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { downloadPdf, downloadExcel } from "@/lib/admin/export";
import { formatDate } from "@/lib/utils";
import type { InvoiceStatus } from "@/models/Invoice";

interface InvoiceRow {
  _id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  dueDate: string;
  createdAt: string;
  customer: { name: string; email: string } | null;
  booking: { bookingNumber: string } | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

function SortIcon({
  field,
  sortBy,
  sortDir,
}: {
  field: string;
  sortBy: string;
  sortDir: "asc" | "desc";
}) {
  if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

async function fetchInvoices(params: {
  page: number;
  status: string;
  view: string;
  search: string;
  sortBy: string;
  sortDir: string;
  all?: boolean;
}): Promise<{ invoices: InvoiceRow[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    view: params.view,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  });
  if (params.status !== "all") searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.all) searchParams.set("all", "true");

  const res = await fetch(`/api/admin/invoices?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function InvoicesClient({
  initialInvoices,
  initialPagination,
}: {
  initialInvoices: InvoiceRow[];
  initialPagination: Pagination;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"active" | "trash">("active");
  const [layout, setLayout] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [confirmState, setConfirmState] = useState<{ type: "cancel" | "delete"; id: string } | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  async function withExportGuard(action: () => Promise<void>): Promise<void> {
    setIsExporting(true);
    try {
      await action();
    } finally {
      setIsExporting(false);
    }
  }

  const isDefaultQuery =
    page === 1 && status === "all" && view === "active" && search === "" && sortBy === "createdAt" && sortDir === "desc";

  const { data } = useQuery({
    queryKey: ["admin", "invoices", { page, status, view, search, sortBy, sortDir }],
    queryFn: () => fetchInvoices({ page, status, view, search, sortBy, sortDir }),
    initialData: isDefaultQuery
      ? { invoices: initialInvoices, pagination: initialPagination }
      : undefined,
  });

  const invoices = data?.invoices ?? [];
  const pagination = data?.pagination ?? initialPagination;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
  }

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invoices/${id}/send`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.invoice;
    },
    onSuccess: () => {
      toast.success("Invoice sent");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invoices/${id}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.invoice;
    },
    onSuccess: () => {
      toast.success("Invoice cancelled");
      invalidate();
      setConfirmState(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Invoice moved to trash");
      invalidate();
      setConfirmState(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/invoices/${id}/restore`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.invoice;
    },
    onSuccess: () => {
      toast.success("Invoice restored");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  async function exportRows(): Promise<{ headers: string[]; rows: (string | number)[][] }> {
    const full = await fetchInvoices({ page: 1, status, view, search, sortBy, sortDir, all: true });
    const headers = ["Invoice #", "Customer", "Total", "Paid", "Due", "Status", "Due Date"];
    const rows = full.invoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.customer?.name ?? "—",
      invoice.total,
      invoice.amountPaid,
      invoice.amountDue,
      STATUS_FILTERS.find((option) => option.value === invoice.status)?.label ?? invoice.status,
      formatDate(invoice.dueDate),
    ]);
    return { headers, rows };
  }

  const cardGrid = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {invoices.map((invoice) => (
        <div key={invoice._id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/admin/invoices/${invoice._id}`} className="font-medium hover:text-accent">
              {invoice.invoiceNumber}
            </Link>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="mt-2 text-sm">{invoice.customer?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{invoice.customer?.email}</p>
          {invoice.booking && (
            <p className="mt-1 text-xs text-muted-foreground">Booking {invoice.booking.bookingNumber}</p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p>{formatCurrency(invoice.total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-emerald-700">{formatCurrency(invoice.amountPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due</p>
              <p className={invoice.amountDue > 0 ? "text-red-700" : undefined}>
                {formatCurrency(invoice.amountDue)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Due {formatDate(invoice.dueDate)}</p>
          <div className="mt-3 flex justify-end">
            {view === "trash" ? (
              <Button variant="outline" size="sm" onClick={() => restoreMutation.mutate(invoice._id)}>
                Restore
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                  Actions <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${invoice._id}`)}>
                    View
                  </DropdownMenuItem>
                  {invoice.status === "draft" && (
                    <DropdownMenuItem onClick={() => sendMutation.mutate(invoice._id)}>
                      Send
                    </DropdownMenuItem>
                  )}
                  {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                    <DropdownMenuItem
                      onClick={() => setConfirmState({ type: "cancel", id: invoice._id })}
                    >
                      Cancel
                    </DropdownMenuItem>
                  )}
                  {(invoice.status === "draft" || invoice.status === "cancelled") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirmState({ type: "delete", id: invoice._id })}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
      {invoices.length === 0 && (
        <p className="col-span-full py-10 text-center text-muted-foreground">No invoices found.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Billing, invoicing, and payment tracking.
          </p>
        </div>
        <ButtonLink href="/admin/invoices/new">New Invoice</ButtonLink>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoice number..."
            className="w-64 pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                STATUS_FILTERS.find((option) => option.value === value)?.label ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={view}
          onValueChange={(value) => {
            setView((value as "active" | "trash") ?? "active");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue>{(value: string) => (value === "active" ? "Active" : "Trash")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trash">Trash</SelectItem>
          </SelectContent>
        </Select>
        <div className="hidden items-center gap-1 rounded-md border border-border p-1 lg:flex">
          <Button
            variant={layout === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setLayout("table")}
            aria-label="Table view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "card" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setLayout("card")}
            aria-label="Card view"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() =>
              withExportGuard(async () => {
                const { headers, rows } = await exportRows();
                await downloadExcel("invoices", "Invoices", headers, rows);
              })
            }
          >
            <Table2 className="h-4 w-4" /> Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() =>
              withExportGuard(async () => {
                const { headers, rows } = await exportRows();
                downloadPdf("invoices", "Invoices", headers, rows);
              })
            }
          >
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="lg:hidden">{cardGrid}</div>

      {layout === "card" ? (
        <div className="hidden lg:block">{cardGrid}</div>
      ) : (
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card lg:block">
        <table className="w-full min-w-[640px] text-sm whitespace-nowrap">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">
                <button className="flex items-center gap-1" onClick={() => toggleSort("invoiceNumber")}>
                  Invoice # <SortIcon field="invoiceNumber" sortBy={sortBy} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">
                <button className="flex items-center gap-1" onClick={() => toggleSort("total")}>
                  Total <SortIcon field="total" sortBy={sortBy} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">
                <button className="flex items-center gap-1" onClick={() => toggleSort("amountDue")}>
                  Due <SortIcon field="amountDue" sortBy={sortBy} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">
                <button className="flex items-center gap-1" onClick={() => toggleSort("dueDate")}>
                  Due Date <SortIcon field="dueDate" sortBy={sortBy} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/invoices/${invoice._id}`} className="hover:text-accent">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p>{invoice.customer?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{invoice.customer?.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {invoice.booking?.bookingNumber ?? "—"}
                </td>
                <td className="px-4 py-3">{formatCurrency(invoice.total)}</td>
                <td className="px-4 py-3 text-emerald-700">{formatCurrency(invoice.amountPaid)}</td>
                <td className="px-4 py-3">
                  {invoice.amountDue > 0 ? (
                    <span className="text-red-700">{formatCurrency(invoice.amountDue)}</span>
                  ) : (
                    formatCurrency(0)
                  )}
                </td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-4 py-3 text-right">
                  {view === "trash" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate(invoice._id)}
                    >
                      Restore
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${invoice._id}`)}>
                          View
                        </DropdownMenuItem>
                        {invoice.status === "draft" && (
                          <DropdownMenuItem onClick={() => sendMutation.mutate(invoice._id)}>
                            Send
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={() => setConfirmState({ type: "cancel", id: invoice._id })}
                          >
                            Cancel
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === "draft" || invoice.status === "cancelled") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setConfirmState({ type: "delete", id: invoice._id })}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} invoices
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        onOpenChange={(open) => !open && setConfirmState(null)}
        title={confirmState?.type === "delete" ? "Delete invoice?" : "Cancel invoice?"}
        description={
          confirmState?.type === "delete"
            ? "This will move the invoice to trash. You can restore it later."
            : "This will mark the invoice as cancelled. This cannot be undone."
        }
        confirmLabel={confirmState?.type === "delete" ? "Delete" : "Cancel Invoice"}
        variant="destructive"
        isLoading={deleteMutation.isPending || cancelMutation.isPending}
        onConfirm={() => {
          if (!confirmState) return;
          if (confirmState.type === "delete") deleteMutation.mutate(confirmState.id);
          else cancelMutation.mutate(confirmState.id);
        }}
      />
    </div>
  );
}
