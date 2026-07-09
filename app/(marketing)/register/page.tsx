import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Color Times Boutique account to book, track, and manage your rentals.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <div className="container-boutique flex min-h-[70svh] items-center justify-center py-20">
      <Reveal className="w-full max-w-md rounded-lg border border-border bg-card p-8 sm:p-10">
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
      </Reveal>
    </div>
  );
}
