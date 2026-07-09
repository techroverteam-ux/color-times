import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { Separator } from "@/components/ui/separator";
import { InstagramIcon, FacebookIcon } from "@/components/icons/social";

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-boutique py-16 grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2">
          <span className="font-heading text-2xl tracking-wide">
            {siteConfig.shortName}
          </span>
          <p className="mt-4 max-w-xs text-sm text-ivory/70 leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href={siteConfig.social.instagram}
              target="_blank"
              className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 transition-colors hover:border-gold hover:text-gold"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </Link>
            <Link
              href={siteConfig.social.facebook}
              target="_blank"
              className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 transition-colors hover:border-gold hover:text-gold"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="kicker text-gold">Shop</h3>
          <ul className="mt-4 space-y-3">
            {siteConfig.footerLinks.shop.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ivory/70 hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="kicker text-gold">Company</h3>
          <ul className="mt-4 space-y-3">
            {siteConfig.footerLinks.company.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ivory/70 hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="kicker text-gold">Get in Touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/70">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{siteConfig.contact.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-ivory">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-ivory">
                {siteConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="bg-ivory/10" />

      <div className="container-boutique flex flex-col gap-3 py-6 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex gap-4">
          {siteConfig.footerLinks.support.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ivory">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
