import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { DressCard } from "@/components/collections/dress-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getAllCategories,
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "@/lib/catalog/queries";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const dresses = await getProductsByCategorySlug(slug);

  return (
    <div className="container-boutique py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Collections</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{category.name}</h1>
        <p className="mt-4 text-muted-foreground">{category.description}</p>
      </Reveal>

      <div className="mt-16">
        {dresses.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="New pieces arriving soon"
            description="We're curating fresh looks for this collection. Check back shortly, or explore our other edits in the meantime."
            action={<ButtonLink href="/collections">Browse All Collections</ButtonLink>}
          />
        ) : (
          <RevealGroup className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {dresses.map((dress) => (
              <RevealItem key={dress.id}>
                <DressCard dress={dress} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
