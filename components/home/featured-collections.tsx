import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { CategorySummary } from "@/lib/catalog/queries";

export function FeaturedCollections({ categories }: { categories: CategorySummary[] }) {
  return (
    <section className="container-boutique py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Curated For Every Occasion</span>
        <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Featured Collections</h2>
        <p className="mt-4 text-muted-foreground">
          From bridal grandeur to festival vibrance — find the perfect designer outfit for your
          next celebration.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-xl">{category.name}</h3>
                    <p className="mt-1 text-sm text-ivory/75">{category.description}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ivory/30 transition-colors group-hover:border-gold group-hover:text-gold">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
