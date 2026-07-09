import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Color Times Boutique for styling appointments, booking enquiries, and support.",
  alternates: { canonical: "/contact" },
};

const contactDetails = [
  {
    icon: MapPin,
    label: "Visit Our Showroom",
    value: siteConfig.contact.address,
  },
  {
    icon: Phone,
    label: "Call or WhatsApp",
    value: siteConfig.contact.phone,
    href: `tel:${siteConfig.contact.phone}`,
  },
  {
    icon: Mail,
    label: "Email Us",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: Clock,
    label: "Showroom Hours",
    value: "Tue – Sun, 11:00 AM – 8:00 PM",
  },
];

export default function ContactPage() {
  return (
    <div className="container-boutique py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">We&apos;d Love to Hear From You</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-muted-foreground">
          Whether it&apos;s a styling consultation or a question about your booking, our team
          typically responds within 24 hours.
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-5">
        <Reveal className="lg:col-span-3 rounded-lg border border-border bg-card p-6 sm:p-10">
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-2 space-y-6">
          {contactDetails.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                {item.href ? (
                  <a href={item.href} className="mt-1 block font-medium hover:text-accent">
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 font-medium">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}
