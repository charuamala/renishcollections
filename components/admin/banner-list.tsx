"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BannerForm } from "@/components/admin/banner-form";
import { deleteBannerAction, toggleBannerActiveAction } from "@/actions/admin/banner.actions";
import type { Banner } from "@prisma/client";

export function BannerList({ banners }: { banners: Banner[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Banners</h1>
        <Button type="button" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {showAddForm && (
        <div className="mt-4 rounded-sm border border-border bg-white p-4">
          <BannerForm onSaved={() => setShowAddForm(false)} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {banners.map((banner) =>
          editingId === banner.id ? (
            <div key={banner.id} className="rounded-sm border border-border bg-white p-4">
              <BannerForm banner={banner} onSaved={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={banner.id} className="flex items-center gap-4 rounded-sm border border-border bg-white p-4">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-sm bg-cream">
                <Image src={banner.imageUrl} alt={banner.title} fill sizes="112px" className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-charcoal">{banner.title}</p>
                  <Badge variant={banner.isActive ? "success" : "outline"}>{banner.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-xs text-ink-400">{banner.placement.replace(/_/g, " ")} · {banner.linkUrl || "no link"}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs text-ink-600 hover:text-maroon-600"
                  disabled={isPending}
                  onClick={() => startTransition(() => toggleBannerActiveAction(banner.id, !banner.isActive))}
                >
                  {banner.isActive ? "Deactivate" : "Activate"}
                </button>
                <button type="button" aria-label="Edit" onClick={() => setEditingId(banner.id)}>
                  <Pencil className="h-4 w-4 text-ink-600 hover:text-maroon-600" />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteBannerAction(banner.id))}
                >
                  <Trash2 className="h-4 w-4 text-ink-600 hover:text-error" />
                </button>
              </div>
            </div>
          ),
        )}
        {banners.length === 0 && <p className="text-sm text-ink-600">No banners yet.</p>}
      </div>
    </div>
  );
}
