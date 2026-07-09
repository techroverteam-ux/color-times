import type { Metadata } from "next";
import { Tag, Gift, Users, Percent } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Offers",
  description: "Current promotions and offers on designer dress rentals from Color Times Boutique.",
  alternates: { canonical: "/offers" },
};

const offers = [
  {
    icon: Gift,
    code: "FIRSTRENT15",
    title: "15% Off Your First Rental",
    description: "New to Color Times? Get 15% off your first booking, any collection, any occasion.",
  },
  {
    icon: Users,
    code: "BRINGAFRIEND",
    title: "Refer & Earn ₹500",
    description: "Invite a friend and you both get ₹500 credit once their first rental is delivered.",
  },
  {
    icon: Percent,
    code: "WEEKDAY20",
    title: "20% Off Weekday Bookings",
    description: "Book a Monday–Thursday delivery slot and save 20% on the rental fee.",
  },
  {
    icon: Tag,
    code: "BUNDLE3",
    title: "Rent 3, Save 10%",
    description: "Booking three or more pieces for the same event? Get an automatic 10% off the total.",
  },
];

export default function OffersPage() {
  return (
    <div className="container-boutique py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">Save More</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Current Offers</h1>
        <p className="mt-4 text-muted-foreground">
          Apply these codes at checkout. Offers cannot be combined unless stated otherwise.
        </p>
      </Reveal>

      <RevealGroup className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {offers.map((offer) => (
          <RevealItem key={offer.code}>
            <div className="flex h-full flex-col rounded-lg border border-border bg-card p-8">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary">
                <offer.icon className="h-5 w-5 text-accent" />
              </div>
              <h2 className="mt-5 font-heading text-xl">{offer.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                {offer.description}
              </p>
              <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-none border border-dashed border-accent px-4 py-2 text-sm font-medium tracking-wide text-accent">
                {offer.code}
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal delay={0.2} className="mt-16 text-center">
        <ButtonLink href="/collections" className="rounded-none px-8">
          Start Browsing
        </ButtonLink>
      </Reveal>
    </div>
  );
}
