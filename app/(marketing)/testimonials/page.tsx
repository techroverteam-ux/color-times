import type { Metadata } from "next";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { testimonials } from "@/lib/data/home-content";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Real stories from customers who celebrated in Color Times Boutique designer rentals.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <div className="container-boutique py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Loved By Our Customers</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Testimonials</h1>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="flex gap-0.5 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </span>
          4.9 out of 5 based on 2,300+ Google reviews
        </div>
      </Reveal>

      <RevealGroup className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <RevealItem key={testimonial.name}>
            <figure className="h-full rounded-lg border border-border bg-card p-8">
              <Quote className="h-6 w-6 text-accent" />
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
