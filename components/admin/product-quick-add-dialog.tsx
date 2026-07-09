"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  quickAddProductSchema,
  type QuickAddProductInput,
} from "@/lib/validations/quick-add-product";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"] as const;

interface CategoryOption {
  _id: string;
  name: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductQuickAddDialog({ categories }: { categories: CategoryOption[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<QuickAddProductInput>({
    resolver: zodResolver(quickAddProductSchema),
    defaultValues: {
      name: "",
      category: categories[0]?._id ?? "",
      size: "M",
      quantityInStock: 1,
      rentalPricePerDay: 0,
      image: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: QuickAddProductInput) => {
      const suffix = Date.now().toString().slice(-6);
      const payload = {
        name: values.name,
        slug: `${slugify(values.name)}-${suffix}`,
        sku: `QA-${suffix}`,
        category: values.category,
        designer: "",
        description: `${values.name} — added via quick add. Full details pending.`,
        color: "Not specified",
        fabric: "Not specified",
        images: [values.image],
        variants: [{ size: values.size, quantityInStock: values.quantityInStock }],
        rentalPricePerDay: values.rentalPricePerDay,
        retailValue: values.rentalPricePerDay * 12,
        securityDeposit: values.rentalPricePerDay * 2,
        isFeatured: false,
        isNewArrival: true,
        isActive: true,
        tags: [],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.product;
    },
    onSuccess: () => {
      toast.success("Product created — edit it anytime to add more detail");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Zap className="h-4 w-4" />
        Quick Add
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
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
                name="quantityInStock"
                render={({ field }) => (
                  <FormItem>
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
            </div>
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      images={field.value ? [field.value] : []}
                      onChange={(images) => field.onChange(images[0] ?? "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      </Dialog>
    </>
  );
}
