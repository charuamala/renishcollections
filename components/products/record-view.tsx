"use client";

import { useRecordRecentlyViewed } from "@/components/products/recently-viewed";

export function RecordView({ slug }: { slug: string }) {
  useRecordRecentlyViewed(slug);
  return null;
}
