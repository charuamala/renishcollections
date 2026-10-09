"use client";

import { useState, useSyncExternalStore } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export interface CheckoutLine {
  name: string;
  variantLabel: string | null;
  quantity: number;
  /** Pre-formatted, e.g. "₹1,099". */
  lineTotal: string;
  href: string;
}

interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const EMPTY: DeliveryDetails = { name: "", phone: "", address: "", city: "", state: "", pincode: "", notes: "" };
const STORAGE_KEY = "rc_checkout_details";

const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/** Accepts "98765 43210", "+91 98765 43210" or "098765 43210" and returns the 10 digits. */
function normalisePhone(value: string) {
  return value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
}

function validate(d: DeliveryDetails) {
  const errors: Partial<Record<keyof DeliveryDetails, string>> = {};
  if (d.name.trim().length < 2) errors.name = "Enter your full name";
  if (!/^[6-9]\d{9}$/.test(normalisePhone(d.phone))) errors.phone = "Enter a 10-digit mobile number";
  if (d.address.trim().length < 5) errors.address = "Enter your house number, street and area";
  if (d.city.trim().length < 2) errors.city = "Enter your city";
  if (!d.state) errors.state = "Choose your state";
  if (!/^\d{6}$/.test(d.pincode.trim())) errors.pincode = "Enter a 6-digit PIN code";
  return errors;
}

export function WhatsAppCheckoutForm({
  whatsappNumber,
  lines,
  subtotal,
  shipping,
  tax,
  total,
}: {
  /** Digits only with country code, e.g. "919940410494". */
  whatsappNumber: string;
  lines: CheckoutLine[];
  subtotal: string;
  shipping: string;
  tax: string | null;
  total: string;
}) {
  const [details, setDetails] = useState<DeliveryDetails>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({});
  const [sent, setSent] = useState(false);

  // Details from a previous order in this browser — offered, not silently filled in.
  const saved = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );

  function update(field: keyof DeliveryDetails, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function buildMessage() {
    const origin = window.location.origin;
    const items = lines
      .map(
        (l, i) =>
          `${i + 1}. ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""} × ${l.quantity} — ${l.lineTotal}\n   ${origin}${l.href}`,
      )
      .join("\n");
    const phone = normalisePhone(details.phone);
    return [
      "Hi Renish Collections, I'd like to place an order.",
      "",
      "*Order*",
      items,
      "",
      `Subtotal: ${subtotal}`,
      `Shipping: ${shipping}`,
      ...(tax ? [`GST: ${tax}`] : []),
      `*Total: ${total}*`,
      "",
      "*Deliver to*",
      details.name.trim(),
      `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`,
      details.address.trim(),
      `${details.city.trim()}, ${details.state} - ${details.pincode.trim()}`,
      ...(details.notes.trim() ? ["", `Note: ${details.notes.trim()}`] : []),
    ].join("\n");
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const found = validate(details);
        setErrors(found);
        if (Object.keys(found).length > 0) {
          document.getElementById(`checkout-${Object.keys(found)[0]}`)?.focus();
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...details, notes: "" }));
        } catch {
          // not critical
        }
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildMessage())}`;
        // A new tab keeps the shopper's cart open; if the browser blocks it, go straight to WhatsApp.
        if (!window.open(url, "_blank", "noopener")) window.location.href = url;
        setSent(true);
      }}
    >
      {saved && !details.name && (
        <button
          type="button"
          onClick={() => {
            try {
              setDetails({ ...EMPTY, ...JSON.parse(saved), notes: "" });
            } catch {
              // ignore unreadable saved details
            }
          }}
          className="w-full rounded-sm border border-dashed border-maroon-600 px-4 py-3 text-sm font-medium text-maroon-600 hover:bg-maroon-50"
        >
          Use my saved delivery details
        </button>
      )}

      <div>
        <Label htmlFor="checkout-name">Full name</Label>
        <Input
          id="checkout-name"
          autoComplete="name"
          value={details.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "checkout-name-error" : undefined}
          className="text-base sm:text-sm"
        />
        <FieldError id="checkout-name-error" message={errors.name} />
      </div>

      <div>
        <Label htmlFor="checkout-phone">Mobile number</Label>
        <div className="flex">
          <span className="flex h-11 items-center rounded-l-sm border border-r-0 border-border bg-cream px-3 text-sm text-ink-600">
            +91
          </span>
          <Input
            id="checkout-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={16}
            value={details.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
            className="rounded-l-none text-base sm:text-sm"
          />
        </div>
        <FieldError id="checkout-phone-error" message={errors.phone} />
      </div>

      <div>
        <Label htmlFor="checkout-address">Address</Label>
        <textarea
          id="checkout-address"
          rows={3}
          autoComplete="street-address"
          placeholder="House / flat number, street, area, landmark"
          value={details.address}
          onChange={(e) => update("address", e.target.value)}
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? "checkout-address-error" : undefined}
          className="w-full rounded-sm border border-border bg-white p-3 text-base text-charcoal placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm"
        />
        <FieldError id="checkout-address-error" message={errors.address} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="checkout-pincode">PIN code</Label>
          <Input
            id="checkout-pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={details.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!errors.pincode}
            aria-describedby={errors.pincode ? "checkout-pincode-error" : undefined}
            className="text-base sm:text-sm"
          />
          <FieldError id="checkout-pincode-error" message={errors.pincode} />
        </div>
        <div>
          <Label htmlFor="checkout-city">City</Label>
          <Input
            id="checkout-city"
            autoComplete="address-level2"
            value={details.city}
            onChange={(e) => update("city", e.target.value)}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "checkout-city-error" : undefined}
            className="text-base sm:text-sm"
          />
          <FieldError id="checkout-city-error" message={errors.city} />
        </div>
        <div>
          <Label htmlFor="checkout-state">State</Label>
          <select
            id="checkout-state"
            autoComplete="address-level1"
            value={details.state}
            onChange={(e) => update("state", e.target.value)}
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? "checkout-state-error" : undefined}
            className="h-11 w-full rounded-sm border border-border bg-white px-3 text-base text-charcoal sm:text-sm"
          >
            <option value="">Select</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FieldError id="checkout-state-error" message={errors.state} />
        </div>
      </div>

      <div>
        <Label htmlFor="checkout-notes">Note for us (optional)</Label>
        <Input
          id="checkout-notes"
          value={details.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="e.g. needed before a wedding date"
          className="text-base sm:text-sm"
        />
      </div>

      <Button type="submit" size="lg" fullWidth className="bg-[#1f7a4d] hover:bg-[#186540]">
        <MessageCircle className="h-5 w-5" />
        Send order on WhatsApp
      </Button>
      <p className="text-center text-xs text-ink-600">
        WhatsApp opens with your order written out — just press send. We&apos;ll reply to confirm your order and
        payment.
      </p>

      {sent && (
        <p role="status" className="rounded-sm bg-cream p-3 text-center text-sm text-charcoal">
          WhatsApp should now be open with your order. Didn&apos;t open?{" "}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildMessage())}`}
            className="font-medium text-maroon-600 underline"
          >
            Tap here
          </a>
          .
        </p>
      )}
    </form>
  );
}
