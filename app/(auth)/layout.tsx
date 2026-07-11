import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
            width={64}
            height={64}
            priority
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <span className="font-heading text-xl tracking-wide">{siteConfig.name}</span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            ERP Portal
          </span>
        </div>

        <div className="mt-6 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
