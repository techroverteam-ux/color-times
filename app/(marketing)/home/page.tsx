import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { PopularDesigners } from "@/components/home/popular-designers";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { RentalProcess } from "@/components/home/rental-process";
import { TrendingDresses } from "@/components/home/trending-dresses";
import { Testimonials } from "@/components/home/testimonials";
import { GalleryPreviewSection } from "@/components/home/gallery-preview";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { getFeaturedCategories, getFeaturedProducts, getPopularDesigners } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Premium Designer Dress Rentals for Every Celebration",
  alternates: { canonical: "/home" },
};

export default async function HomePage() {
  const [categories, dresses, designers] = await Promise.all([
    getFeaturedCategories(),
    getFeaturedProducts(),
    getPopularDesigners(),
  ]);

  return (
    <>
      <Hero images={dresses.slice(0, 4).map((dress) => dress.image)} />
      <Stats />
      <FeaturedCollections categories={categories} />
      <PopularDesigners designers={designers} />
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
