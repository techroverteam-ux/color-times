"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export default function AdminError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 font-heading text-2xl">Something Went Wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This page hit an unexpected error. Your data is safe — try again, or head back to the
        dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <ButtonLink variant="outline" href="/admin">
          Back to Dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
