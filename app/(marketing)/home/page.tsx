import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { RentalProcess } from "@/components/home/rental-process";
import { TrendingDresses } from "@/components/home/trending-dresses";
import { Testimonials } from "@/components/home/testimonials";
import { GalleryPreviewSection } from "@/components/home/gallery-preview";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { getFeaturedCategories, getFeaturedProducts } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Premium Designer Dress Rentals for Every Celebration",
  alternates: { canonical: "/home" },
};

export default async function HomePage() {
  const [categories, dresses] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <Hero image={dresses[0]?.image} />
      <Stats />
      <FeaturedCollections categories={categories} />
      <WhyChooseUs />
      <RentalProcess />
      <TrendingDresses dresses={dresses} />
      <Testimonials />
      <GalleryPreviewSection />
      <FaqSection />
      <CtaBanner image={dresses[dresses.length - 1]?.image} />
    </>
  );
}
