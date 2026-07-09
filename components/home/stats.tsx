import { AnimatedCounter } from "@/components/motion/animated-counter";
import { Reveal } from "@/components/motion/reveal";
import { stats } from "@/lib/data/home-content";

export function Stats() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-boutique grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08} className="text-center">
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals}
              className="font-heading text-4xl text-charcoal sm:text-5xl"
            />
            <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
