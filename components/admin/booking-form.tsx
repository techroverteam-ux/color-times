"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
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
import { daysBetween } from "@/lib/utils";

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

function BookingItemRow({
  index,
  control,
  products,
  rentalStartDate,
  rentalEndDate,
  canRemove,
  onRemove,
  onProductChange,
  onConflictChange,
}: {
  index: number;
  control: Control<BookingCreateInput>;
  products: ProductOption[];
  rentalStartDate: string;
  rentalEndDate: string;
  canRemove: boolean;
  onRemove: () => void;
  onProductChange: (index: number) => void;
  onConflictChange: (index: number, hasConflict: boolean) => void;
}) {
  const productValue = useWatch({ control, name: `items.${index}.product` });
  const quantityValue = useWatch({ control, name: `items.${index}.quantity` }) || 1;

  const selectedProduct = products.find((p) => p._id === productValue);
  const sizeOptions = useMemo(() => selectedProduct?.variants ?? [], [selectedProduct]);
  const days = daysBetween(rentalStartDate, rentalEndDate);
  const fee = selectedProduct ? selectedProduct.rentalPricePerDay * days * quantityValue : 0;
  const deposit = selectedProduct ? selectedProduct.securityDeposit * quantityValue : 0;

  const availabilityQuery = useQuery({
    queryKey: ["admin", "product-availability", productValue, rentalStartDate, rentalEndDate],
    queryFn: () => fetchAvailability(productValue, rentalStartDate, rentalEndDate),
    enabled: Boolean(productValue && rentalStartDate && rentalEndDate),
  });

  const hasConflict = availabilityQuery.data?.available === false;

  useEffect(() => {
    onConflictChange(index, hasConflict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConflict, index]);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <FormField
          control={control}
          name={`items.${index}.product`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dress</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value ?? "");
                  onProductChange(index);
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
          control={control}
          name={`items.${index}.size`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                <FormControl>
                  <SelectTrigger className="w-full" disabled={!selectedProduct}>
                    <SelectValue placeholder="Size" />
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
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qty</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!canRemove}
            onClick={onRemove}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedProduct && days > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {formatCurrency(fee)} rental + {formatCurrency(deposit)} deposit
        </p>
      )}

      {hasConflict && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            This dress is already booked for an overlapping date range
            {availabilityQuery.data?.conflicts[0]
              ? ` (${availabilityQuery.data.conflicts[0].bookingNumber})`
              : ""}
            . Choose different dates or a different dress.
          </p>
        </div>
      )}
    </div>
  );
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
      items: [{ product: "", size: "", quantity: 1 }],
      rentalStartDate: "",
      rentalEndDate: "",
      eventDate: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const customerValue = form.watch("customer");
  const rentalStartDate = form.watch("rentalStartDate");
  const rentalEndDate = form.watch("rentalEndDate");
  const items = form.watch("items");

  const days = daysBetween(rentalStartDate, rentalEndDate);
  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.product);
    if (!product || !days) return sum;
    const quantity = item.quantity || 1;
    return sum + product.rentalPricePerDay * days * quantity + product.securityDeposit * quantity;
  }, 0);

  const [conflicts, setConflicts] = useState<Record<number, boolean>>({});
  const hasAnyConflict = Object.values(conflicts).some(Boolean);

  function handleConflictChange(index: number, hasConflict: boolean) {
    setConflicts((prev) => (prev[index] === hasConflict ? prev : { ...prev, [index]: hasConflict }));
  }

  function handleProductChange(index: number) {
    form.setValue(`items.${index}.size`, "");
  }

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-6"
      >
        <section className="space-y-4 rounded-lg border border-border bg-card p-6">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ product: "", size: "", quantity: 1 })}
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <BookingItemRow
              key={field.id}
              index={index}
              control={form.control}
              products={products}
              rentalStartDate={rentalStartDate}
              rentalEndDate={rentalEndDate}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
              onProductChange={handleProductChange}
              onConflictChange={handleConflictChange}
            />
          ))}
        </section>

        <section className="rounded-lg border border-border bg-secondary/40 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total (rental + deposit)</span>
            <span className="font-heading text-xl">{formatCurrency(total)}</span>
          </div>
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
          <Button type="submit" disabled={mutation.isPending || hasAnyConflict}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Booking
          </Button>
        </div>
      </form>
    </Form>
  );
}
