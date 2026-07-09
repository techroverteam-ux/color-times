"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <p className="text-sm text-muted-foreground">{pagination.total} customers</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
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
                  {new Date(customer.createdAt).toLocaleDateString("en-IN")}
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

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
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
    </div>
  );
}
