import { Truck, ShieldCheck, RefreshCcw, Sparkles } from "lucide-react";

const REASONS = [
  { icon: Truck, title: "Fast Shipping", description: "Dispatched within 24–48 hours, across India." },
  { icon: ShieldCheck, title: "Secure Payments", description: "Your transactions are encrypted and protected." },
  { icon: RefreshCcw, title: "Easy Returns", description: "Hassle-free returns on eligible products." },
  { icon: Sparkles, title: "Handpicked Quality", description: "Every saree checked before it reaches you." },
];

export function WhyShopWithUs() {
  return (
    <section className="bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-center text-2xl font-semibold text-charcoal sm:text-3xl">
          Why Shop With Us
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-600 text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-sm font-semibold text-charcoal">{title}</p>
              <p className="mt-1 text-xs text-ink-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
