"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { productSchema, type ProductInput } from "@/lib/validations/product";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"] as const;

interface CategoryOption {
  _id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  productId?: string;
  defaultValues?: ProductInput;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ categories, productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? {
      name: "",
      slug: "",
      sku: "",
      category: categories[0]?._id ?? "",
      designer: "",
      description: "",
      color: "",
      fabric: "",
      images: [],
      variants: [{ size: "M", quantityInStock: 0 }],
      rentalPricePerDay: 0,
      retailValue: 0,
      securityDeposit: 0,
      isFeatured: false,
      isNewArrival: false,
      isActive: true,
      tags: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProductInput) => {
      const url = isEditing ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.product;
    },
    onSuccess: () => {
      toast.success(isEditing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        className="space-y-8"
      >
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-lg">Basic Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!isEditing) form.setValue("slug", slugify(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category">
                          {(value: string) =>
                            categories.find((cat) => cat._id === value)?.name ??
                            "Select a category"
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
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
              name="designer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designer (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fabric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabric</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-lg">Images</h2>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField images={field.value} onChange={field.onChange} multiple />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">Sizes & Stock</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ size: "M", quantityInStock: 0 })}
            >
              <Plus className="h-4 w-4" />
              Add Size
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {fields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="flex items-end gap-3">
                <FormField
                  control={form.control}
                  name={`variants.${index}.size`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Size</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.quantityInStock`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-lg">Pricing</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="rentalPricePerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rental Price / Day (&#8377;)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
                  <FormLabel>Security Deposit (&#8377;)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="retailValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail Value (&#8377;)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {isEditing && (
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-heading text-lg">Inventory Status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Updates automatically when a booking is confirmed, returned, or sent for dry
              cleaning/repair. Override manually if needed.
            </p>
            <div className="mt-4 max-w-xs">
              <FormField
                control={form.control}
                name="status"
                render={() => (
                  <FormItem>
                    <Select
                      value={form.watch("status") ?? "available"}
                      onValueChange={(value) => form.setValue("status", value as ProductInput["status"])}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="under_dry_cleaning">Under Dry Cleaning</SelectItem>
                        <SelectItem value="under_repair">Under Repair</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        )}

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-lg">Visibility</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            {(["isActive", "isFeatured", "isNewArrival"] as const).map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="h-4 w-4 rounded border-input"
                      />
                      {key === "isActive" && "Active (visible on site)"}
                      {key === "isFeatured" && "Featured"}
                      {key === "isNewArrival" && "New Arrival"}
                    </label>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
