"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  serviceOrderSchema,
  type ServiceOrderInput,
} from "@/lib/validations/service-order";

export interface ServiceOrderRow {
  _id: string;
  serviceType: "dry_clean" | "tailor";
  product: { _id: string; name: string; sku: string } | null;
  description: string;
  status: string;
  cost: number;
  assignedTo?: string;
  sentDate: string;
  expectedReturnDate: string;
  notes?: string;
}

interface ProductOption {
  _id: string;
  name: string;
  sku: string;
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

const EMPTY_VALUES: ServiceOrderInput = {
  serviceType: "dry_clean",
  product: "",
  description: "",
  cost: 0,
  assignedTo: "",
  sentDate: new Date().toISOString().slice(0, 10),
  expectedReturnDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function ServiceOrderFormDialog({
  open,
  onOpenChange,
  products,
  editingOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductOption[];
  editingOrder: ServiceOrderRow | null;
}) {
  const queryClient = useQueryClient();

  const form = useForm<ServiceOrderInput>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editingOrder
          ? {
              serviceType: editingOrder.serviceType,
              product: editingOrder.product?._id ?? "",
              description: editingOrder.description,
              cost: editingOrder.cost,
              assignedTo: editingOrder.assignedTo ?? "",
              sentDate: toDateInputValue(editingOrder.sentDate),
              expectedReturnDate: toDateInputValue(editingOrder.expectedReturnDate),
              notes: editingOrder.notes ?? "",
            }
          : EMPTY_VALUES
      );
    }
  }, [open, editingOrder, form]);

  const productValue = form.watch("product");
  const serviceTypeValue = form.watch("serviceType");
  const selectedProduct = products.find((p) => p._id === productValue);

  const mutation = useMutation({
    mutationFn: async (values: ServiceOrderInput) => {
      const url = editingOrder
        ? `/api/admin/service-orders/${editingOrder._id}`
        : "/api/admin/service-orders";
      const res = await fetch(url, {
        method: editingOrder ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.order;
    },
    onSuccess: () => {
      toast.success(editingOrder ? "Service order updated" : "Service order created");
      queryClient.invalidateQueries({ queryKey: ["admin", "service-orders"] });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingOrder ? "Edit Service Order" : "New Service Order"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={() => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      value={serviceTypeValue}
                      onValueChange={(value) =>
                        form.setValue("serviceType", value as "dry_clean" | "tailor")
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: "dry_clean" | "tailor") =>
                              value === "dry_clean" ? "Dry Clean" : "Tailor / Alteration"
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dry_clean">Dry Clean</SelectItem>
                        <SelectItem value="tailor">Tailor / Alteration</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="product"
              render={() => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    value={productValue}
                    onValueChange={(value) => form.setValue("product", value ?? "")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product">
                          {() =>
                            selectedProduct
                              ? `${selectedProduct.name} (${selectedProduct.sku})`
                              : "Select a product"
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Hem shortening, stain removal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sent Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedReturnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. In-house tailor, ABC Dry Cleaners" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingOrder ? "Save Changes" : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
