"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceStatusBadge } from "@/components/admin/invoice-status-badge";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import type { BookingStatus } from "@/models/Booking";
import type { InvoiceStatus } from "@/models/Invoice";

interface SearchResults {
  products: { _id: string; name: string; sku: string; image: string | null }[];
  customers: { _id: string; name: string; email: string; phone: string | null }[];
  bookings: { _id: string; bookingNumber: string; status: BookingStatus; customerName: string | null }[];
  invoices: { _id: string; invoiceNumber: string; status: InvoiceStatus; customerName: string | null }[];
}

const EMPTY_RESULTS: SearchResults = { products: [], customers: [], bookings: [], invoices: [] };

async function fetchSearch(q: string): Promise<SearchResults> {
  const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const { data = EMPTY_RESULTS, isFetching } = useQuery({
    queryKey: ["admin", "search", debounced],
    queryFn: () => fetchSearch(debounced),
    enabled: debounced.length >= 2,
  });

  const hasQuery = debounced.length >= 2;
  const hasResults =
    data.products.length + data.customers.length + data.bookings.length + data.invoices.length > 0;

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search bill no., dress code, dress name, customer, mobile..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
            />
            {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {!hasQuery && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </p>
            )}
            {hasQuery && !isFetching && !hasResults && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matches found.
              </p>
            )}

            {data.bookings.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bookings
                </p>
                {data.bookings.map((booking) => (
                  <button
                    key={booking._id}
                    type="button"
                    onClick={() => go(`/admin/bookings/${booking._id}`)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span>
                      {booking.bookingNumber}
                      {booking.customerName && (
                        <span className="text-muted-foreground"> — {booking.customerName}</span>
                      )}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </button>
                ))}
              </div>
            )}

            {data.invoices.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Invoices
                </p>
                {data.invoices.map((invoice) => (
                  <button
                    key={invoice._id}
                    type="button"
                    onClick={() => go(`/admin/invoices/${invoice._id}`)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span>
                      {invoice.invoiceNumber}
                      {invoice.customerName && (
                        <span className="text-muted-foreground"> — {invoice.customerName}</span>
                      )}
                    </span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </button>
                ))}
              </div>
            )}

            {data.products.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Dresses
                </p>
                {data.products.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => go(`/admin/products/${product._id}`)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span>{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.sku}</span>
                  </button>
                ))}
              </div>
            )}

            {data.customers.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Customers
                </p>
                {data.customers.map((customer) => (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() => go(`/admin/customers/${customer._id}`)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span>{customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {customer.phone ?? customer.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
