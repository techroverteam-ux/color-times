import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Color Times Boutique collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-boutique max-w-3xl py-20">
      <span className="kicker">Legal</span>
      <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: January 1, 2026</p>

      <div className="prose-boutique mt-10 space-y-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
        <section>
          <h2 className="font-heading text-xl">1. Information We Collect</h2>
          <p className="mt-3">
            When you create an account, book a rental, or contact us, we collect information such
            as your name, email address, phone number, delivery address, and payment details. We
            also collect usage data such as pages visited and items viewed to improve your
            browsing experience.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl">2. How We Use Your Information</h2>
          <p className="mt-3">We use your information to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Process and fulfil your rental bookings, including delivery and pickup logistics</li>
            <li>Communicate booking confirmations, reminders, and support updates</li>
            <li>Process payments and refunds securely through our payment partners</li>
            <li>Improve our collections, recommendations, and overall service quality</li>
            <li>Send promotional offers, where you have opted in to receive them</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl">3. Payment Information</h2>
          <p className="mt-3">
            All payments are processed through PCI-compliant third-party payment gateways. Color
            Times Boutique does not store your full card details on its own servers.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl">4. Data Sharing</h2>
          <p className="mt-3">
            We do not sell your personal information. We share data only with logistics partners
            (for delivery and pickup), payment processors (for transactions), and when required by
            law.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl">5. Cookies</h2>
          <p className="mt-3">
            We use cookies to keep you signed in, remember your wishlist and cart, and understand
            how visitors use our site. You can disable cookies in your browser settings, though
            some features may not function correctly as a result.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl">6. Data Security</h2>
          <p className="mt-3">
            We use industry-standard encryption and access controls to protect your data. Access
            to customer information is restricted to authorised personnel who need it to perform
            their duties.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl">7. Your Rights</h2>
          <p className="mt-3">
            You may request access to, correction of, or deletion of your personal data at any
            time by contacting us at{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-accent underline underline-offset-4">
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl">8. Contact Us</h2>
          <p className="mt-3">
            For any privacy-related questions, reach us at {siteConfig.contact.email} or{" "}
            {siteConfig.contact.phone}.
          </p>
        </section>
      </div>
    </div>
  );
}
