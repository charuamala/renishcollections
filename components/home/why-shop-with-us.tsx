import { Truck, MessageCircle, Sparkles, type LucideIcon } from "lucide-react";

/** Store promises, built only from owner-confirmed settings — a point is dropped when its fact isn't set. */
export function WhyShopWithUs({
  deliveryTime,
  contactPhone,
  supportHours,
}: {
  deliveryTime: string | null;
  contactPhone: string | null;
  supportHours: string | null;
}) {
  const reasons: { icon: LucideIcon; title: string; description: string }[] = [];
  if (deliveryTime) {
    reasons.push({ icon: Truck, title: `Delivered in ${deliveryTime}`, description: "Your saree reaches your doorstep quickly." });
  }
  if (contactPhone) {
    reasons.push({
      icon: MessageCircle,
      title: supportHours ? `Support ${supportHours}` : "Talk to us",
      description: `Call or WhatsApp ${contactPhone}.`,
    });
  }
  reasons.push({ icon: Sparkles, title: "Handpicked Quality", description: "Every saree checked before it reaches you." });

  return (
    <section className="bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-center text-2xl font-semibold text-charcoal sm:text-3xl">Why Shop With Us</h2>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-600 text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-sm font-semibold text-charcoal">{title}</p>
              <p className="mt-1 text-sm text-ink-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
