"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="flex min-h-[80svh] flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <AlertTriangle className="h-9 w-9 text-accent" strokeWidth={1.5} />
        </div>
        <h1 className="mt-8 font-heading text-3xl sm:text-4xl">Something Went Wrong</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          We hit an unexpected error loading this page. Please try again, or head back to
          somewhere familiar.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button className="rounded-none px-8" onClick={reset}>
            Try Again
          </Button>
          <ButtonLink variant="outline" className="rounded-none px-8" href="/home">
            Back to Home
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
