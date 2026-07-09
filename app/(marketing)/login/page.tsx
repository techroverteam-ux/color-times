import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Color Times Boutique account.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="container-boutique flex min-h-[70svh] items-center justify-center py-20">
      <Reveal className="w-full max-w-md rounded-lg border border-border bg-card p-8 sm:p-10">
        <div className="text-center">
          <span className="kicker">Welcome Back</span>
          <h1 className="mt-3 font-heading text-3xl">Sign In</h1>
        </div>

        <div className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Color Times?{" "}
          <Link href="/register" className="text-accent underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
