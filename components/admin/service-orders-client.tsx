"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceOrderStatusBadge } from "@/components/admin/service-order-status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  ServiceOrderFormDialog,
  type ServiceOrderRow,
} from "@/components/admin/service-order-form-dialog";
import { formatDate } from "@/lib/utils";
import type { ServiceOrderStatus, ServiceType } from "@/models/ServiceOrder";

interface ProductOption {
  _id: string;
  name: string;
  sku: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS: ServiceOrderStatus[] = [
  "pending",
  "in_progress",
  "quality_check",
  "completed",
  "cancelled",
];

function formatCurrency(value?: number): string {
  return `₹${(value ?? 0).toLocaleString("en-IN")}`;
}

async function fetchServiceOrders(params: {
  page: number;
  status: string;
  serviceType: ServiceType;
  view: string;
}): Promise<{ orders: ServiceOrderRow[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    view: params.view,
    serviceType: params.serviceType,
  });
  if (params.status !== "all") searchParams.set("status", params.status);

  const res = await fetch(`/api/admin/service-orders?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function ServiceOrdersClient({
  initialOrders,
  initialPagination,
  products,
}: {
  initialOrders: ServiceOrderRow[];
  initialPagination: Pagination;
  products: ProductOption[];
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [serviceType, setServiceType] = useState<ServiceType>("dry_clean");
  const [view, setView] = useState<"active" | "trash">("active");
  const [layout, setLayout] = useState<"table" | "card">("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrderRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isDefaultQuery =
    page === 1 && status === "all" && serviceType === "dry_clean" && view === "active";

  const { data } = useQuery({
    queryKey: ["admin", "service-orders", { page, status, serviceType, view }],
    queryFn: () => fetchServiceOrders({ page, status, serviceType, view }),
    initialData: isDefaultQuery
      ? { orders: initialOrders, pagination: initialPagination }
      : undefined,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? initialPagination;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "service-orders"] });
  }

  const statusMutation = useMutation({
    mutationFn: async ({ id, status: newStatus }: { id: string; status: ServiceOrderStatus }) => {
      const res = await fetch(`/api/admin/service-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.order;
    },
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/service-orders/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Service order deleted");
      invalidate();
      setDeleteId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cardGrid = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <div key={order._id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{order.product?.name ?? "—"}</p>
            {view === "trash" && (
              <ServiceOrderStatusBadge status={order.status as ServiceOrderStatus} />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {serviceType === "dry_clean" ? "Dry Clean" : order.stitchingType || "Tailor / Alteration"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{order.description}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {serviceType === "dry_clean" ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Dry Clean</p>
                  <p>{formatCurrency(order.dryCleanCharge)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Iron</p>
                  <p>{formatCurrency(order.ironCharge)}</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">Stitching</p>
                <p>{formatCurrency(order.stitchingCharge)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Other</p>
              <p>{formatCurrency(order.otherCharge)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned To</p>
              <p>{order.assignedTo ?? "—"}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Expected return {formatDate(order.expectedReturnDate)}
          </p>
          {view === "active" && (
            <>
              <Select
                value={order.status}
                onValueChange={(value) => {
                  if (value && value !== order.status) {
                    statusMutation.mutate({ id: order._id, status: value as ServiceOrderStatus });
                  }
                }}
              >
                <SelectTrigger className="mt-3 w-full" size="sm">
                  <SelectValue>{(value: string) => value.replace("_", " ")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingOrder(order);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setDeleteId(order._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
      {orders.length === 0 && (
        <p className="col-span-full py-10 text-center text-muted-foreground">No service orders found.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Dry Clean &amp; Tailor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track dresses sent for cleaning, alteration, and repair.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingOrder(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Service Order
        </Button>
      </div>

      <Tabs
        value={serviceType}
        onValueChange={(value) => {
          setServiceType((value as ServiceType) ?? "dry_clean");
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="dry_clean">Dry Clean</TabsTrigger>
          <TabsTrigger value="tailor">Tailor / Alteration</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string) => (value === "all" ? "All Statuses" : value.replace("_", " "))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replace("_", " ")}
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
      </div>

      <div className="lg:hidden">{cardGrid}</div>

      {layout === "card" ? (
        <div className="hidden lg:block">{cardGrid}</div>
      ) : (
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card lg:block">
        <table className="w-full min-w-[820px] text-sm whitespace-nowrap">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Description</th>
              {serviceType === "dry_clean" ? (
                <>
                  <th className="px-4 py-3">Dry Clean</th>
                  <th className="px-4 py-3">Iron</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Stitching Type</th>
                  <th className="px-4 py-3">Stitching</th>
                </>
              )}
              <th className="px-4 py-3">Other</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Expected Return</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{order.product?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.description}</td>
                {serviceType === "dry_clean" ? (
                  <>
                    <td className="px-4 py-3">{formatCurrency(order.dryCleanCharge)}</td>
                    <td className="px-4 py-3">{formatCurrency(order.ironCharge)}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-muted-foreground">{order.stitchingType ?? "—"}</td>
                    <td className="px-4 py-3">{formatCurrency(order.stitchingCharge)}</td>
                  </>
                )}
                <td className="px-4 py-3">{formatCurrency(order.otherCharge)}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.assignedTo ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(order.expectedReturnDate)}
                </td>
                <td className="px-4 py-3">
                  {view === "trash" ? (
                    <ServiceOrderStatusBadge status={order.status as ServiceOrderStatus} />
                  ) : (
                    <Select
                      value={order.status}
                      onValueChange={(value) => {
                        if (value && value !== order.status) {
                          statusMutation.mutate({ id: order._id, status: value as ServiceOrderStatus });
                        }
                      }}
                    >
                      <SelectTrigger size="sm" className="w-40">
                        <SelectValue>
                          {(value: string) => value.replace("_", " ")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="px-4 py-3">
                  {view === "active" && (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingOrder(order);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteId(order._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No service orders found.
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
        itemLabel="orders"
        onPageChange={setPage}
      />

      <ServiceOrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        products={products}
        editingOrder={editingOrder}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete service order?"
        description="This will move the service order to trash."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
