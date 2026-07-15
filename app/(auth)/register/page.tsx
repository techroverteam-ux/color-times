import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthChrome } from "@/components/auth/auth-chrome";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Color Times Boutique account to book, track, and manage your rentals.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <AuthChrome>
      <div className="w-full rounded-xl border border-border/60 bg-card p-8 shadow-xl shadow-black/[0.04] sm:p-10">
        <div className="text-center">
          <span className="kicker">Join Us</span>
          <h1 className="mt-3 font-heading text-3xl">Create Your Account</h1>
        </div>

        <div className="mt-8">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthChrome>
  );
}
