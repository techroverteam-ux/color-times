"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResendVerificationBanner() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-medium">Please verify your email address</p>
          <p className="text-sm text-muted-foreground">
            {status === "sent"
              ? "Verification email sent — check your inbox."
              : "We'll send a verification link to confirm it's really you."}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={status === "sending" || status === "sent"}
      >
        {status === "sent" ? "Sent" : status === "sending" ? "Sending..." : "Resend Email"}
      </Button>
    </div>
  );
}
