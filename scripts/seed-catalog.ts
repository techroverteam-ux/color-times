import { connectToDatabase } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { collectionMeta, dressCatalog, type CollectionSlug } from "@/lib/data/products";

async function main() {
  await connectToDatabase();

  const slugToCategoryId = new Map<CollectionSlug, string>();

  const slugs = Object.keys(collectionMeta) as CollectionSlug[];
  for (let index = 0; index < slugs.length; index += 1) {
    const slug = slugs[index];
    const meta = collectionMeta[slug];

    const category = await Category.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: meta.name,
          slug,
          description: meta.description,
          heroImage: meta.heroImage,
          displayOrder: index,
          isFeatured: true,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    slugToCategoryId.set(slug, String(category._id));
  }

  console.log(`Seeded ${slugToCategoryId.size} categories.`);

  let productCount = 0;
  for (const dress of dressCatalog) {
    const categoryId = slugToCategoryId.get(dress.category);
    if (!categoryId) continue;

    await Product.findOneAndUpdate(
      { sku: `CTB-${dress.id.padStart(4, "0")}` },
      {
        $set: {
          name: dress.name,
          slug: dress.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          sku: `CTB-${dress.id.padStart(4, "0")}`,
          category: categoryId,
          designer: dress.designer,
          description: `${dress.name} by ${dress.designer} — a ${dress.color.toLowerCase()} piece crafted for standout moments. Rented, cleaned, and delivered with white-glove care.`,
          color: dress.color,
          fabric: "Premium blend",
          images: [dress.image],
          variants: dress.sizes.map((size) => ({
            size,
            quantityInStock: 3,
          })),
          rentalPricePerDay: dress.pricePerDay,
          retailValue: dress.pricePerDay * 12,
          securityDeposit: dress.securityDeposit,
          isFeatured: productCount < 6,
          isNewArrival: Boolean(dress.isNewArrival),
          isActive: true,
          tags: [dress.category, dress.color.toLowerCase()],
        },
      },
      { upsert: true }
    );
    productCount += 1;
  }

  console.log(`Seeded ${productCount} products.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed catalog:", error);
  process.exit(1);
});
