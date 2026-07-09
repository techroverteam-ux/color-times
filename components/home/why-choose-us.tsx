import { Sparkles, ShieldCheck, Ruler, Truck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { whyChooseUs } from "@/lib/data/home-content";

const icons = { Sparkles, ShieldCheck, Ruler, Truck } as const;

export function WhyChooseUs() {
  return (
    <section className="bg-secondary/40 py-24">
      <div className="container-boutique">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="kicker">The Color Times Promise</span>
          <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Why Choose Us</h2>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <RevealItem key={item.title} className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-accent/40 bg-background">
                  <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-heading text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
