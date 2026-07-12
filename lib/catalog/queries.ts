import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Category, type ICategory } from "@/models/Category";
import { Product } from "@/models/Product";
import type { DressListing, CollectionSlug } from "@/lib/data/products";

const PUBLICLY_VISIBLE_FILTER = { isActive: true, archivedAt: null, deletedAt: null };

export interface CategorySummary {
  _id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
}

function isPlaceholderImage(url: string): boolean {
  return !url || url.startsWith("/images/placeholder/");
}

async function withRealHeroImages(categories: CategorySummary[]): Promise<CategorySummary[]> {
  const needsFallback = categories.filter((category) => isPlaceholderImage(category.heroImage));
  if (needsFallback.length === 0) return categories;

  const products = await Product.find({
    category: { $in: needsFallback.map((category) => category._id) },
    ...PUBLICLY_VISIBLE_FILTER,
  })
    .select("category images isFeatured")
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();

  const imageByCategory = new Map<string, string>();
  for (const product of products) {
    const categoryId = String(product.category);
    if (!imageByCategory.has(categoryId) && product.images[0]) {
      imageByCategory.set(categoryId, product.images[0]);
    }
  }

  return categories.map((category) =>
    isPlaceholderImage(category.heroImage) && imageByCategory.has(category._id)
      ? { ...category, heroImage: imageByCategory.get(category._id)! }
      : category
  );
}

function toDressListing(product: {
  _id: unknown;
  name: string;
  designer?: string;
  category: unknown;
  rentalPricePerDay: number;
  securityDeposit: number;
  variants: { size: string }[];
  color: string;
  images: string[];
  isNewArrival: boolean;
}): DressListing {
  const category = product.category as unknown as { slug?: string } | string;
  const categorySlug =
    typeof category === "object" && category !== null && "slug" in category
      ? (category.slug as CollectionSlug)
      : (category as CollectionSlug);

  return {
    id: String(product._id),
    name: product.name,
    designer: product.designer ?? "",
    category: categorySlug,
    pricePerDay: product.rentalPricePerDay,
    securityDeposit: product.securityDeposit,
    sizes: product.variants.map((variant) => variant.size),
    color: product.color,
    image: product.images[0],
    isNewArrival: product.isNewArrival,
  };
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  await connectToDatabase();
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
  return withRealHeroImages(
    categories.map((category) => ({
      _id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      heroImage: category.heroImage,
    }))
  );
}

export async function getFeaturedCategories(limit = 6): Promise<CategorySummary[]> {
  await connectToDatabase();
  const categories = await Category.find({ isFeatured: true })
    .sort({ displayOrder: 1 })
    .limit(limit)
    .lean();
  return withRealHeroImages(
    categories.map((category) => ({
      _id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      heroImage: category.heroImage,
    }))
  );
}

export async function getCategoryBySlug(slug: string): Promise<ICategory | null> {
  await connectToDatabase();
  return Category.findOne({ slug }).lean();
}

export async function getProductsByCategorySlug(slug: string): Promise<DressListing[]> {
  await connectToDatabase();
  const category = await Category.findOne({ slug }).select("_id").lean();
  if (!category) return [];

  const products = await Product.find({ category: category._id, ...PUBLICLY_VISIBLE_FILTER })
    .sort({ createdAt: -1 })
    .lean();

  return products.map((product) =>
    toDressListing({ ...product, category: slug })
  );
}

export async function getFeaturedProducts(limit = 6): Promise<DressListing[]> {
  await connectToDatabase();
  const products = await Product.find({ isFeatured: true, ...PUBLICLY_VISIBLE_FILTER })
    .populate("category", "slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map(toDressListing);
}

export async function getAllActiveProducts(limit = 24): Promise<DressListing[]> {
  await connectToDatabase();
  const products = await Product.find(PUBLICLY_VISIBLE_FILTER)
    .populate("category", "slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map(toDressListing);
}
