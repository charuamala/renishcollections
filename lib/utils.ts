import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Decimal from "decimal.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a Decimal/number/string price as INR currency, e.g. ₹1,499. */
export function formatPrice(value: Decimal.Value, currency = "INR") {
  const amount = new Decimal(value).toNumber();
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Returns the integer discount percentage between original and selling price. */
export function discountPercentage(original: Decimal.Value, selling: Decimal.Value) {
  const originalD = new Decimal(original);
  const sellingD = new Decimal(selling);
  if (originalD.lessThanOrEqualTo(0) || sellingD.greaterThanOrEqualTo(originalD)) return 0;
  return originalD.minus(sellingD).dividedBy(originalD).times(100).toDecimalPlaces(0).toNumber();
}

export function slugifyText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RC${y}${m}${d}${rand}`;
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
