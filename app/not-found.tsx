import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[80svh] flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <Compass className="h-9 w-9 text-accent" strokeWidth={1.5} />
        </div>
        <p className="mt-8 font-heading text-8xl italic text-accent">404</p>
        <h1 className="mt-4 font-heading text-3xl sm:text-4xl">
          This Look Isn&apos;t in Our Collection
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          The page you&apos;re looking for may have been moved, renamed, or never existed. Let&apos;s
          get you back to something beautiful.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <ButtonLink className="rounded-none px-8" href="/">
            Back to Home
          </ButtonLink>
          <ButtonLink variant="outline" className="rounded-none px-8" href="/collections">
            Explore Collections
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
