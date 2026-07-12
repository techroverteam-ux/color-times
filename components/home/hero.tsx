"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { heroSlides } from "@/lib/data/home-content";

export function Hero({ image }: { image?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const slide = heroSlides[0];

  return (
    <section ref={ref} className="relative -mt-20 h-[100svh] min-h-[640px] w-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={image ?? slide.image}
          alt="Featured designer dress"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top scale-110 blur-[3px] saturate-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/55 to-charcoal/60" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6"
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
          className="font-heading text-5xl italic text-ivory sm:text-6xl md:text-7xl lg:text-8xl"
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
          <ButtonLink
            size="lg"
            className="rounded-none px-8 h-14 text-base"
            href="/collections"
          >
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
