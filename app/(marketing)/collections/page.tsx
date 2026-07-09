import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getAllCategories } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse Color Times Boutique's curated designer dress collections — wedding, bridal, party wear, festival, and more.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const categories = await getAllCategories();

  return (
    <div className="container-boutique py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Shop by Occasion</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">All Collections</h1>
        <p className="mt-4 text-muted-foreground">
          {categories.length} curated edits, one purpose — helping you find the exact look for
          your moment.
        </p>
      </Reveal>

      <RevealGroup className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <RevealItem key={category.slug}>
            <Link
              href={`/collections/${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-secondary"
            >
              <Image
                src={category.heroImage}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <h2 className="font-heading text-2xl">{category.name}</h2>
                <p className="mt-1 text-sm text-ivory/75">{category.description}</p>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
