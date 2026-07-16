"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid3x3, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { CustomerImportDialog } from "@/components/admin/customer-import-dialog";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { formatDate } from "@/lib/utils";

interface CustomerRow {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

async function fetchCustomers(params: {
  page: number;
  search: string;
}): Promise<{ customers: CustomerRow[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams({ page: String(params.page) });
  if (params.search) searchParams.set("search", params.search);

  const res = await fetch(`/api/admin/customers?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function CustomersClient({
  initialCustomers,
  initialPagination,
}: {
  initialCustomers: CustomerRow[];
  initialPagination: Pagination;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<"table" | "card">("table");

  const isDefaultQuery = page === 1 && search === "";

  const { data } = useQuery({
    queryKey: ["admin", "customers", { page, search }],
    queryFn: () => fetchCustomers({ page, search }),
    initialData: isDefaultQuery
      ? { customers: initialCustomers, pagination: initialPagination }
      : undefined,
  });

  const customers = data?.customers ?? [];
  const pagination = data?.pagination ?? initialPagination;

  const cardGrid = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <div key={customer._id} className="rounded-lg border border-border bg-card p-4">
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
          <p className="text-sm text-muted-foreground">{customer.phone ?? "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Joined {formatDate(customer.createdAt)}
          </p>
          <div className="mt-3 flex justify-end">
            <ButtonLink variant="outline" size="sm" href={`/admin/customers/${customer._id}`}>
              View
            </ButtonLink>
          </div>
        </div>
      ))}
      {customers.length === 0 && (
        <p className="col-span-full py-10 text-center text-muted-foreground">No customers found.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{pagination.total} customers</p>
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
          <CustomerImportDialog />
          <ButtonLink href="/admin/customers/new" size="sm">
            New Customer
          </ButtonLink>
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(customer.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ButtonLink
                    variant="ghost"
                    size="sm"
                    href={`/admin/customers/${customer._id}`}
                  >
                    View
                  </ButtonLink>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        itemLabel="customers"
        onPageChange={setPage}
      />
    </div>
  );
}
