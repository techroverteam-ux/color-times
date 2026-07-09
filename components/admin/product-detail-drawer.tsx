"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogList } from "@/components/admin/audit-log-list";

interface ProductDetail {
  _id: string;
  name: string;
  sku: string;
  description: string;
  designer?: string;
  color: string;
  fabric: string;
  images: string[];
  category: { name: string } | null;
  variants: { size: string; quantityInStock: number }[];
  rentalPricePerDay: number;
  retailValue: number;
  securityDeposit: number;
  isActive: boolean;
  tags: string[];
}

async function fetchProduct(id: string): Promise<ProductDetail> {
  const res = await fetch(`/api/admin/products/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data.product;
}

export function ProductDetailDrawer({
  productId,
  onClose,
}: {
  productId: string | null;
  onClose: () => void;
}) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["admin", "product-detail", productId],
    queryFn: () => fetchProduct(productId as string),
    enabled: Boolean(productId),
  });

  return (
    <Sheet open={productId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading || !product ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="font-heading text-xl">{product.name}</SheetTitle>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <Badge variant={product.isActive ? "default" : "secondary"} className="rounded-full">
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6 p-6">
              {product.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image) => (
                    <div
                      key={image}
                      className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary"
                    >
                      <Image src={image} alt={product.name} fill sizes="80px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Category</p>
                      <p className="mt-0.5">{product.category?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Designer</p>
                      <p className="mt-0.5">{product.designer || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Color</p>
                      <p className="mt-0.5">{product.color}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Fabric</p>
                      <p className="mt-0.5">{product.fabric}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-3 text-sm">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Price/Day</p>
                      <p className="mt-0.5 font-medium">
                        &#8377;{product.rentalPricePerDay.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Deposit</p>
                      <p className="mt-0.5 font-medium">
                        &#8377;{product.securityDeposit.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Retail Value</p>
                      <p className="mt-0.5 font-medium">
                        &#8377;{product.retailValue.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Sizes &amp; Stock</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <Badge key={variant.size} variant="secondary" className="rounded-full">
                          {variant.size}: {variant.quantityInStock}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {product.tags.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Tags</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <ButtonLink href={`/admin/products/${product._id}`} className="w-full">
                    Edit Full Details
                  </ButtonLink>
                </TabsContent>

                <TabsContent value="activity">
                  <AuditLogList entityType="Product" entityId={product._id} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
