import type { Metadata } from "next";
import Image from "next/image";
import { Lock } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Access Restricted",
  robots: { index: false, follow: false },
};

export default function SiteLockedPage() {
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-6 py-12">
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gold)" }}
      />

      <div className="relative flex w-full flex-col items-center">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={200}
            height={200}
            priority
            className="h-36 w-36 object-contain sm:h-40 sm:w-40"
          />
          <span className="font-heading text-xl tracking-wide">{siteConfig.name}</span>
        </div>

        <div className="mt-6 w-full max-w-md rounded-xl border border-border/60 bg-card p-8 text-center shadow-xl shadow-black/[0.04] sm:p-10">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <span className="kicker mt-4 inline-block">Access Restricted</span>
          <h1 className="mt-2 font-heading text-3xl">This site is currently private</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please connect with your administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}
