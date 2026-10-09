import Link from "next/link";
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsappIcon } from "@/components/icons/social-icons";
import { getSiteSettings } from "@/services/settings.service";
import { SITE_NAME } from "@/lib/constants";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { Logo } from "@/components/layout/logo";

export async function Footer() {
  const settings = await getSiteSettings();
  const storeName = settings.storeName || SITE_NAME;

  // Only accounts the store has actually set up — never placeholder handles.
  const social = [
    { label: "Instagram", href: settings.instagramUrl, icon: InstagramIcon },
    { label: "WhatsApp", href: settings.whatsappUrl, icon: WhatsappIcon },
    { label: "Facebook", href: settings.facebookUrl, icon: FacebookIcon },
    { label: "YouTube", href: settings.youtubeUrl, icon: YoutubeIcon },
  ].filter((s): s is typeof s & { href: string } => !!s.href);

  const phoneHref = settings.contactPhone ? `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}` : null;
  const hasContact = settings.contactPhone || settings.contactEmail || settings.whatsappUrl;

  return (
    <footer className="mt-16 border-t border-border bg-cream pb-20 sm:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Logo variant="stacked" className="h-24 sm:h-28" alt={storeName} />
            <p className="mt-5 max-w-xs text-sm text-ink-600">
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
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-maroon-600 hover:bg-maroon-600 hover:text-white"
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

          {hasContact && (
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm font-semibold text-charcoal">Reach Us</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-600">
                {settings.contactPhone && phoneHref && (
                  <li>
                    <a href={phoneHref} className="hover:text-maroon-600">
                      {settings.contactPhone}
                    </a>
                  </li>
                )}
                {settings.whatsappUrl && (
                  <li>
                    <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-maroon-600">
                      Chat on WhatsApp
                    </a>
                  </li>
                )}
                {settings.contactEmail && (
                  <li>
                    <a href={`mailto:${settings.contactEmail}`} className="break-all hover:text-maroon-600">
                      {settings.contactEmail}
                    </a>
                  </li>
                )}
                {settings.supportHours && <li className="text-ink-500">Available {settings.supportHours}</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <NewsletterForm />
        </div>

        <div className="mt-8 space-y-1 text-center text-xs text-ink-600">
          <p>
            © {new Date().getFullYear()} {settings.legalName || storeName}
            {settings.address && ` · ${settings.address}`}. All rights reserved.
          </p>
          {settings.grievanceOfficerName && (
            <p>
              Grievance Officer: {settings.grievanceOfficerName}
              {settings.grievanceOfficerEmail && (
                <>
                  {" · "}
                  <a href={`mailto:${settings.grievanceOfficerEmail}`} className="underline-offset-2 hover:underline">
                    {settings.grievanceOfficerEmail}
                  </a>
                </>
              )}
            </p>
          )}
        </div>
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
