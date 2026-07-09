import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getAllActiveProducts } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore our styled looks and real celebrations dressed by Color Times Boutique.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const dressCatalog = await getAllActiveProducts();

  return (
    <div className="py-20">
      <Reveal className="container-boutique mx-auto max-w-2xl text-center">
        <span className="kicker">Styled Moments</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Gallery</h1>
        <p className="mt-4 text-muted-foreground">
          A closer look at the pieces our customers have loved for their weddings, festivals, and
          celebrations.
        </p>
      </Reveal>

      <RevealGroup className="mt-16 columns-2 gap-3 px-3 sm:columns-3 lg:columns-4 sm:gap-4 sm:px-8 lg:px-12">
        {dressCatalog.map((dress, index) => (
          <RevealItem key={dress.id} className="mb-3 break-inside-avoid sm:mb-4">
            <div
              className="group relative overflow-hidden rounded-lg bg-secondary"
              style={{ aspectRatio: index % 3 === 0 ? "3/4" : "4/5" }}
            >
              <Image
                src={dress.image}
                alt={dress.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-charcoal/90 to-transparent p-4 text-ivory transition-transform duration-300 group-hover:translate-y-0">
                <p className="text-sm font-medium">{dress.name}</p>
                <p className="text-xs text-ivory/70">{dress.designer}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
