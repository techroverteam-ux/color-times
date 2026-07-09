import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { faqs } from "@/lib/data/home-content";

export function FaqSection({ full = false }: { full?: boolean }) {
  const items = full ? faqs : faqs.slice(0, 4);

  return (
    <section className="container-boutique py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Good to Know</span>
        <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Frequently Asked Questions</h2>
      </Reveal>

      <Reveal className="mx-auto mt-14 max-w-3xl">
        <Accordion className="w-full">
          {items.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-heading text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {!full && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Have more questions?{" "}
            <Link href="/faq" className="text-accent underline underline-offset-4">
              Visit our full FAQ page
            </Link>
          </p>
        )}
      </Reveal>
    </section>
  );
}
