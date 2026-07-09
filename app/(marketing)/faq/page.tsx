import type { Metadata } from "next";
import { FaqSection } from "@/components/home/faq-section";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about renting designer dresses from Color Times Boutique.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <FaqSection full />;
}
