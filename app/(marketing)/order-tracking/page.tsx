import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { OrderTrackingForm } from "@/components/forms/order-tracking-form";

export const metadata: Metadata = {
  title: "Order Tracking",
  description: "Track the status of your Color Times Boutique rental booking.",
  alternates: { canonical: "/order-tracking" },
};

export default function OrderTrackingPage() {
  return (
    <div className="container-boutique flex min-h-[70svh] items-center justify-center py-20">
      <Reveal className="w-full max-w-md rounded-lg border border-border bg-card p-8 sm:p-10">
        <div className="text-center">
          <span className="kicker">Where&apos;s My Order</span>
          <h1 className="mt-3 font-heading text-3xl">Track Your Booking</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your booking number and the email used at checkout.
          </p>
        </div>

        <div className="mt-8">
          <OrderTrackingForm />
        </div>
      </Reveal>
    </div>
  );
}
