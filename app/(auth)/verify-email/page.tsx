import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { connectToDatabase } from "@/lib/db/connect";
import { verifyEmailToken } from "@/lib/notifications/verification-email";
import { ButtonLink } from "@/components/ui/button-link";
import { AuthChrome } from "@/components/auth/auth-chrome";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  await connectToDatabase();
  const result = token
    ? await verifyEmailToken(token)
    : { success: false, message: "Missing verification token." };

  return (
    <AuthChrome>
      <div className="w-full rounded-xl border border-border/60 bg-card p-8 text-center shadow-xl shadow-black/[0.04] sm:p-10">
        {result.success ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
        )}
        <h1 className="mt-4 font-heading text-2xl">
          {result.success ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
        <ButtonLink href="/login" className="mt-6">
          Continue to Sign In
        </ButtonLink>
      </div>
    </AuthChrome>
  );
}
