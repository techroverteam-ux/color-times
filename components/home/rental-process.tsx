import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { rentalProcess } from "@/lib/data/home-content";

export function RentalProcess() {
  return (
    <section className="container-boutique py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Simple & Seamless</span>
        <h2 className="mt-3 font-heading text-4xl sm:text-5xl">How Renting Works</h2>
      </Reveal>

      <RevealGroup className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
        {rentalProcess.map((item) => (
          <RevealItem key={item.step} className="relative text-center">
            <div className="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full bg-charcoal font-heading text-ivory">
              {item.step}
            </div>
            <h3 className="mt-5 font-heading text-lg">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
