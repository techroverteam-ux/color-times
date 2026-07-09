import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-28">
      <Image
        src="/images/placeholder/dresses/dress-12.png"
        alt="Book your appointment"
        fill
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-charcoal/70" />
      <Reveal className="container-boutique relative text-center text-ivory">
        <h2 className="font-heading text-4xl italic sm:text-5xl">
          Ready to find your perfect look?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ivory/80">
          Book a styling appointment at our Bandra showroom, or browse the full collection online.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink size="lg" className="rounded-none px-8" href="/collections">
            Explore Collection
          </ButtonLink>
          <ButtonLink
            size="lg"
            variant="outline"
            className="rounded-none border-ivory/40 bg-transparent px-8 text-ivory hover:bg-ivory hover:text-charcoal"
            href="/contact"
          >
            Book Now
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
