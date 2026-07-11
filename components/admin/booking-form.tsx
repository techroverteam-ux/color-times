"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
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
import { bookingCreateSchema, type BookingCreateInput } from "@/lib/validations/booking";

interface CustomerOption {
  _id: string;
  name: string;
  email: string;
}

interface ProductOption {
  _id: string;
  name: string;
  sku: string;
  rentalPricePerDay: number;
  securityDeposit: number;
  variants: { size: string; quantityInStock: number }[];
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

async function fetchAvailability(
  productId: string,
  from: string,
  to: string
): Promise<{ available: boolean; conflicts: { bookingNumber: string }[] }> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/admin/products/${productId}/availability?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function BookingForm({
  customers,
  products,
}: {
  customers: CustomerOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const form = useForm<BookingCreateInput>({
    resolver: zodResolver(bookingCreateSchema),
    defaultValues: {
      customer: "",
      product: "",
      size: "",
      rentalStartDate: "",
      rentalEndDate: "",
      eventDate: "",
      rentalFee: 0,
      securityDeposit: 0,
      totalAmount: 0,
      deliveryAddress: "",
      notes: "",
    },
  });

  const customerValue = form.watch("customer");
  const productValue = form.watch("product");
  const sizeValue = form.watch("size");
  const rentalStartDate = form.watch("rentalStartDate");
  const rentalEndDate = form.watch("rentalEndDate");
  const rentalFee = form.watch("rentalFee") || 0;
  const securityDeposit = form.watch("securityDeposit") || 0;

  const selectedProduct = products.find((p) => p._id === productValue);

  useEffect(() => {
    if (!selectedProduct) return;
    const days = daysBetween(rentalStartDate, rentalEndDate);
    if (days > 0) {
      form.setValue("rentalFee", selectedProduct.rentalPricePerDay * days);
    }
    form.setValue("securityDeposit", selectedProduct.securityDeposit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productValue, rentalStartDate, rentalEndDate]);

  useEffect(() => {
    form.setValue("totalAmount", rentalFee + securityDeposit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentalFee, securityDeposit]);

  const availabilityQuery = useQuery({
    queryKey: ["admin", "product-availability", productValue, rentalStartDate, rentalEndDate],
    queryFn: () => fetchAvailability(productValue, rentalStartDate, rentalEndDate),
    enabled: Boolean(productValue && rentalStartDate && rentalEndDate),
  });

  const hasConflict = availabilityQuery.data?.available === false;

  const mutation = useMutation({
    mutationFn: async (values: BookingCreateInput) => {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.booking;
    },
    onSuccess: () => {
      toast.success("Booking created");
      router.push("/admin/bookings");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sizeOptions = useMemo(() => selectedProduct?.variants ?? [], [selectedProduct]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-6"
      >
        <section className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customer"
            render={() => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  value={customerValue}
                  onValueChange={(value) => form.setValue("customer", value ?? "")}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select customer">
                        {(value: string) => {
                          const customer = customers.find((c) => c._id === value);
                          return customer ? `${customer.name} (${customer.email})` : "Select customer";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No customers yet.
                      </div>
                    )}
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} ({customer.email})
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
            name="product"
            render={() => (
              <FormItem>
                <FormLabel>Dress</FormLabel>
                <Select
                  value={productValue}
                  onValueChange={(value) => {
                    form.setValue("product", value ?? "");
                    form.setValue("size", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select dress">
                        {(value: string) => {
                          const product = products.find((p) => p._id === value);
                          return product ? `${product.name} (${product.sku})` : "Select dress";
                        }}
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
            name="size"
            render={() => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select
                  value={sizeValue}
                  onValueChange={(value) => form.setValue("size", value ?? "")}
                >
                  <FormControl>
                    <SelectTrigger className="w-full" disabled={!selectedProduct}>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizeOptions.map((variant) => (
                      <SelectItem key={variant.size} value={variant.size}>
                        {variant.size} ({variant.quantityInStock} in stock)
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
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rentalStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Start Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rentalEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental End Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {hasConflict && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              This dress is already booked for an overlapping date range
              {availabilityQuery.data?.conflicts[0]
                ? ` (${availabilityQuery.data.conflicts[0].bookingNumber})`
                : ""}
              . Choose different dates or a different dress.
            </p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="rentalFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Fee (₹)</FormLabel>
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
          <FormField
            control={form.control}
            name="securityDeposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Deposit (₹)</FormLabel>
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
          <FormItem>
            <FormLabel>Total</FormLabel>
            <p className="flex h-9 items-center font-medium">
              {formatCurrency(rentalFee + securityDeposit)}
            </p>
          </FormItem>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <FormField
            control={form.control}
            name="deliveryAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending || hasConflict}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Booking
          </Button>
        </div>
      </form>
    </Form>
  );
}
