import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gold)" }}
      />

      <Link href="/" className="absolute left-6 top-6 text-sm text-muted-foreground hover:text-accent">
        &larr; Back to site
      </Link>

      <div className="relative flex w-full flex-col items-center">
        <Link href="/" className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={112}
            height={112}
            priority
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
          <span className="font-heading text-2xl tracking-wide">{siteConfig.name}</span>
        </Link>

        <div className="mt-8 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
