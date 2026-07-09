import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons/social";
import { Reveal } from "@/components/motion/reveal";
import { galleryPreview } from "@/lib/data/home-content";
import { siteConfig } from "@/lib/config/site";

export function GalleryPreviewSection() {
  return (
    <section className="py-24">
      <div className="container-boutique">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="kicker">Follow Along</span>
          <h2 className="mt-3 font-heading text-4xl sm:text-5xl">@ColorTimesBoutique</h2>
          <p className="mt-4 text-muted-foreground">
            Real looks, real celebrations — tag us to be featured.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-1 sm:grid-cols-6">
        {galleryPreview.map((image, index) => (
          <Link
            key={image + index}
            href={siteConfig.social.instagram}
            target="_blank"
            className="group relative aspect-square overflow-hidden bg-secondary"
          >
            <Image
              src={image}
              alt="Color Times Boutique Instagram post"
              fill
              sizes="(min-width: 640px) 16.6vw, 33vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/0 transition-colors group-hover:bg-charcoal/50">
              <InstagramIcon className="h-6 w-6 text-ivory opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
