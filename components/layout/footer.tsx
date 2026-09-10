import Link from "next/link";
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsappIcon } from "@/components/icons/social-icons";
import { getSiteSettings } from "@/services/settings.service";
import { SITE_NAME, DEFAULT_SOCIAL_LINKS } from "@/lib/constants";
import { NewsletterForm } from "@/components/home/newsletter-form";

export async function Footer() {
  const settings = await getSiteSettings();

  const social = [
    { label: "Instagram", href: settings.instagramUrl || DEFAULT_SOCIAL_LINKS.instagram, icon: InstagramIcon },
    { label: "WhatsApp", href: settings.whatsappUrl || DEFAULT_SOCIAL_LINKS.whatsapp, icon: WhatsappIcon },
    { label: "Facebook", href: settings.facebookUrl || DEFAULT_SOCIAL_LINKS.facebook, icon: FacebookIcon },
    { label: "YouTube", href: settings.youtubeUrl || DEFAULT_SOCIAL_LINKS.youtube, icon: YoutubeIcon },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-cream pb-20 sm:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-lg font-semibold text-maroon-700">{settings.storeName || SITE_NAME}</p>
            <p className="mt-2 max-w-xs text-sm text-ink-600">
              Premium sarees for every occasion — sourced with care, styled for the modern Indian woman.
            </p>
            <div className="mt-4 flex gap-3">
              {social.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-maroon-600 hover:bg-maroon-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              { label: "New Arrivals", href: "/new-arrivals" },
              { label: "Best Sellers", href: "/best-sellers" },
              { label: "Offers", href: "/offers" },
              { label: "All Products", href: "/shop" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
            ]}
          />
          <FooterColumn
            title="Help"
            links={[
              { label: "My Orders", href: "/account/orders" },
              { label: "My Account", href: "/account" },
            ]}
          />
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <NewsletterForm />
        </div>

        <p className="mt-8 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} {settings.storeName || SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-charcoal">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-ink-600 hover:text-maroon-600">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
