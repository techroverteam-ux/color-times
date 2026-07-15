import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { DesignerSummary } from "@/lib/catalog/queries";

export function PopularDesigners({ designers }: { designers: DesignerSummary[] }) {
  if (designers.length === 0) return null;

  return (
    <section className="container-boutique py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Curated Labels</span>
        <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Trusted by Style Icons</h2>
        <p className="mt-4 text-muted-foreground">
          Rent from the designer houses and boutiques already trusted by our brides and guests.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {designers.map((designer) => (
          <RevealItem key={designer.name}>
            <div className="grid h-28 place-items-center rounded-lg border border-border bg-secondary/50 px-4 text-center transition-colors hover:bg-secondary">
              <p className="font-heading text-lg leading-tight tracking-wide">{designer.name}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
