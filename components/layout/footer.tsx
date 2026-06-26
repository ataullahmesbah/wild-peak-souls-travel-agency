import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Send,
} from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { footerNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';

const socialLinks = [
  { icon: Facebook, href: siteConfig.links.facebook, label: 'Facebook' },
  { icon: Instagram, href: siteConfig.links.instagram, label: 'Instagram' },
  { icon: Twitter, href: siteConfig.links.twitter, label: 'Twitter' },
  { icon: Youtube, href: siteConfig.links.youtube, label: 'YouTube' },
  { icon: Linkedin, href: siteConfig.links.linkedin, label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container py-12 lg:py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold lg:text-3xl">
                Join the Adventure
              </h3>
              <p className="text-muted-foreground text-pretty">
                Subscribe for exclusive travel deals, expedition updates, and
                stories from the wild.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                aria-label="Email address"
              />
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground text-pretty max-w-xs">
              {siteConfig.description}
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                {siteConfig.contact.email}
              </a>
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {siteConfig.contact.phone}
              </a>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                {siteConfig.contact.address}
              </p>
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerNav).map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
