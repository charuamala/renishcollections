"use client";

import { useActionState, useState, useEffect } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createBannerAction, updateBannerAction, type BannerFormState } from "@/actions/admin/banner.actions";
import type { Banner } from "@prisma/client";

const initialState: BannerFormState = {};

function toDateInput(date?: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function BannerForm({ banner, onSaved }: { banner?: Banner; onSaved?: () => void }) {
  const action = banner ? updateBannerAction.bind(null, banner.id) : createBannerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [imageUrl, setImageUrl] = useState<string | null>(banner?.imageUrl ?? null);

  useEffect(() => {
    if (state.success) onSaved?.();
  }, [state.success, onSaved]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />

      <div className="sm:col-span-2">
        <ImageUploader value={imageUrl} onChange={setImageUrl} label="Banner Image" />
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={banner?.title} required />
      </div>
      <div>
        <Label htmlFor="linkUrl">Link URL</Label>
        <Input id="linkUrl" name="linkUrl" defaultValue={banner?.linkUrl ?? ""} placeholder="/sarees" />
      </div>

      <div>
        <Label htmlFor="placement">Placement</Label>
        <select
          id="placement"
          name="placement"
          defaultValue={banner?.placement ?? "HOME_HERO"}
          className="h-11 w-full rounded-sm border border-border bg-white px-3 text-sm"
        >
          <option value="HOME_HERO">Home Hero</option>
          <option value="HOME_PROMO">Home Promo</option>
          <option value="CATEGORY_TOP">Category Top</option>
          <option value="MOBILE_STRIP">Mobile Strip</option>
        </select>
      </div>
      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input id="displayOrder" name="displayOrder" type="number" defaultValue={banner?.displayOrder ?? 0} />
      </div>

      <div>
        <Label htmlFor="startsAt">Start Date (optional)</Label>
        <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInput(banner?.startsAt)} />
      </div>
      <div>
        <Label htmlFor="endsAt">End Date (optional)</Label>
        <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInput(banner?.endsAt)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
        <input type="checkbox" name="isActive" defaultChecked={banner?.isActive ?? true} className="h-4 w-4" />
        Active
      </label>

      {state.error && <p className="text-sm text-error sm:col-span-2">{state.error}</p>}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
        </Button>
      </div>
    </form>
  );
}
