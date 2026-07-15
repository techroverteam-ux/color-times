"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { heroSlides } from "@/lib/data/home-content";
import { cn } from "@/lib/utils";

function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden="true">
      <path d="M4 60 C4 28 28 4 60 4" stroke="var(--gold)" strokeWidth="1" opacity="0.5" />
      <path d="M4 90 C4 40 40 4 90 4" stroke="var(--gold)" strokeWidth="1" opacity="0.35" />
      <circle cx="4" cy="4" r="3" fill="var(--gold)" opacity="0.6" />
      <path d="M20 40 Q30 20 50 24 Q40 34 20 40Z" fill="var(--gold)" opacity="0.25" />
      <path d="M40 15 Q55 8 70 18 Q58 25 40 15Z" fill="var(--gold)" opacity="0.2" />
    </svg>
  );
}

function HeroImagePanel({ src, side }: { src: string; side: "left" | "right" }) {
  return (
    <div className="relative h-full flex-1 overflow-hidden">
      <Image
        src={src}
        alt="Featured designer dress"
        fill
        priority
        sizes="18vw"
        className="object-cover object-top saturate-75 contrast-105"
      />
      {/* Blend the photo into the wine backdrop — top, bottom, and the inner edge facing the headline */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-transparent to-primary/85" />
      <div
        className={cn(
          "absolute inset-0",
          side === "left"
            ? "bg-gradient-to-r from-transparent via-transparent to-primary"
            : "bg-gradient-to-l from-transparent via-transparent to-primary"
        )}
      />
    </div>
  );
}

export function Hero({ images = [] }: { images?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const slide = heroSlides[0];
  const leftImages = images.slice(0, 2);
  const rightImages = images.slice(2, 4);

  return (
    <section
      ref={ref}
      className="relative -mt-20 min-h-[640px] w-full overflow-hidden bg-primary py-24 lg:h-[100svh] lg:py-0"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[30%] lg:flex">
        {leftImages.map((src) => (
          <HeroImagePanel key={src} src={src} side="left" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[30%] lg:flex">
        {rightImages.map((src) => (
          <HeroImagePanel key={src} src={src} side="right" />
        ))}
      </div>

      <CornerFlourish className="pointer-events-none absolute left-0 top-0 z-10 h-40 w-40 lg:h-56 lg:w-56" />
      <CornerFlourish className="pointer-events-none absolute bottom-0 right-0 z-10 h-40 w-40 rotate-180 lg:h-56 lg:w-56" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center lg:px-[31%]"
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="kicker text-gold mb-5"
        >
          {slide.kicker}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="font-heading text-5xl italic text-ivory sm:text-6xl md:text-7xl"
        >
          {slide.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 max-w-xl text-base text-ivory/85 sm:text-lg"
        >
          {slide.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <ButtonLink size="lg" className="rounded-none px-8 h-14 text-base" href="/collections">
            Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
          <ButtonLink
            size="lg"
            variant="outline"
            className="rounded-none px-8 h-14 text-base border-ivory/40 bg-transparent text-ivory hover:bg-ivory hover:text-charcoal"
            href="/contact"
          >
            Book an Appointment
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ivory/80"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
