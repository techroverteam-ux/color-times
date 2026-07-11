"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Heart, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/config/site";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useSession();

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isScrolled ? "glass border-b border-border/60 shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="container-boutique flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo-icon.png"
            alt={siteConfig.name}
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="font-heading text-xl tracking-wide">
            {siteConfig.shortName}
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {siteConfig.nav.map((item) => (
            <li
              key={item.href}
              className="relative"
              onMouseEnter={() => item.children && setOpenMenu(item.label)}
              onMouseLeave={() => item.children && setOpenMenu(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors hover:text-accent",
                  pathname === item.href ? "text-accent" : "text-foreground/80"
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>

              <AnimatePresence>
                {item.children && openMenu === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3"
                  >
                    <div className="glass rounded-lg border border-border/60 p-2 shadow-lg">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-md px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-accent"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-2">
          <ButtonLink variant="ghost" size="icon" aria-label="Wishlist" href="/wishlist">
            <Heart className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink
            variant="ghost"
            size="icon"
            aria-label="Account"
            href={user ? "/account" : "/login"}
          >
            <User className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink className="ml-2 rounded-none px-6" href="/collections">
            Book Now
          </ButtonLink>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="lg:hidden"
            render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm p-0">
            <SheetHeader className="border-b border-border/60 px-6 py-5">
              <SheetTitle className="font-heading text-lg">{siteConfig.shortName}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col p-6 gap-1 overflow-y-auto">
              {siteConfig.nav.map((item) => (
                <div key={item.href} className="border-b border-border/40 py-2">
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="flex flex-col pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="py-2 text-sm text-muted-foreground"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href={user ? "/account" : "/login"}
                className="mt-4 py-2 text-base font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {user ? "My Account" : "Login / Register"}
              </Link>
              <ButtonLink
                className="mt-4 rounded-none"
                href="/collections"
                onClick={() => setMobileOpen(false)}
              >
                Book Now
              </ButtonLink>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
