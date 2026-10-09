import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, Clock, type LucideIcon } from "lucide-react";
import { getSiteSettings } from "@/services/settings.service";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Renish Collections by phone, WhatsApp or email.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phoneHref = settings.contactPhone ? `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}` : null;

  // Only channels the store has set up in Admin → Settings.
  const channels: { icon: LucideIcon; title: string; detail: string; href: string; action: string; external?: boolean }[] =
    [];
  if (settings.whatsappUrl) {
    channels.push({
      icon: MessageCircle,
      title: "WhatsApp",
      detail: settings.whatsappNumber || settings.contactPhone || "Chat with us",
      href: `${settings.whatsappUrl}?text=${encodeURIComponent("Hi Renish Collections, I have a question.")}`,
      action: "Chat on WhatsApp",
      external: true,
    });
  }
  if (settings.contactPhone && phoneHref) {
    channels.push({ icon: Phone, title: "Call us", detail: settings.contactPhone, href: phoneHref, action: "Call now" });
  }
  if (settings.contactEmail) {
    channels.push({
      icon: Mail,
      title: "Email",
      detail: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
      action: "Send an email",
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Contact Us</h1>
      <p className="mt-3 text-base text-ink-600">
        Questions about a saree or your order? Reach us however suits you
        {settings.supportHours ? ` — we're available ${settings.supportHours}` : ""}.
      </p>

      {channels.length > 0 ? (
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-card border border-border bg-white">
          {channels.map(({ icon: Icon, title, detail, href, action, external }) => (
            <li key={title}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-4 p-5 transition-colors hover:bg-cream"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-maroon-600 text-ivory">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-charcoal">{title}</span>
                  <span className="block break-all text-sm text-ink-600">{detail}</span>
                </span>
                <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-maroon-600 sm:inline">
                  {action}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-ink-600">Contact details will be added soon.</p>
      )}

      <dl className="mt-10 grid gap-6 sm:grid-cols-2">
        {settings.address && (
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-maroon-600" strokeWidth={1.75} />
            <div>
              <dt className="text-sm font-semibold text-charcoal">{settings.legalName || settings.storeName}</dt>
              <dd className="text-sm text-ink-600">{settings.address}</dd>
            </div>
          </div>
        )}
        {(settings.supportHours || settings.deliveryTime) && (
          <div className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-maroon-600" strokeWidth={1.75} />
            <div>
              {settings.supportHours && (
                <>
                  <dt className="text-sm font-semibold text-charcoal">Support hours</dt>
                  <dd className="text-sm text-ink-600">{settings.supportHours}</dd>
                </>
              )}
              {settings.deliveryTime && (
                <dd className="mt-1 text-sm text-ink-600">Orders are delivered in {settings.deliveryTime}.</dd>
              )}
            </div>
          </div>
        )}
      </dl>

      {settings.grievanceOfficerName && (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-base font-semibold text-charcoal">Grievance Officer</h2>
          <p className="mt-2 text-sm text-ink-600">
            {settings.grievanceOfficerName}
            {settings.grievanceOfficerEmail && (
              <>
                {" · "}
                <a href={`mailto:${settings.grievanceOfficerEmail}`} className="text-maroon-600 hover:underline">
                  {settings.grievanceOfficerEmail}
                </a>
              </>
            )}
          </p>
        </section>
      )}
    </div>
  );
}
