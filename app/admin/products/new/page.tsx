import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 }).select("name").lean();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">New Product</h1>
      <ProductForm
        categories={categories.map((category) => ({
          _id: String(category._id),
          name: category.name,
        }))}
      />
    </div>
  );
}
