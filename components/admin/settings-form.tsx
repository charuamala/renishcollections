"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSiteSettingsAction, type SettingsFormState } from "@/actions/admin/settings.actions";
import type { SiteSettings } from "@prisma/client";

const initialState: SettingsFormState = {};

/** SiteSettings with Decimal fields serialized to strings — Decimal instances can't cross the server/client boundary as props. */
export type SerializedSiteSettings = Omit<SiteSettings, "taxPercentage" | "freeShippingThreshold"> & {
  taxPercentage: string;
  freeShippingThreshold: string | null;
};

export function SettingsForm({ settings }: { settings: SerializedSiteSettings }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, initialState);

  return (
    <form action={formAction} className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="storeName">Store Name</Label>
        <Input id="storeName" name="storeName" defaultValue={settings.storeName} required />
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} />
      </div>
      <div>
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone ?? ""} />
      </div>
      <div>
        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
        <Input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={settings.address ?? ""} />
      </div>
      <div>
        <Label htmlFor="legalName">Legal Business Name</Label>
        <Input id="legalName" name="legalName" defaultValue={settings.legalName ?? ""} />
      </div>
      <div>
        <Label htmlFor="supportHours">Support Hours</Label>
        <Input id="supportHours" name="supportHours" defaultValue={settings.supportHours ?? ""} placeholder="e.g. 24/7" />
      </div>

      <div>
        <Label htmlFor="deliveryTime">Delivery Time</Label>
        <Input id="deliveryTime" name="deliveryTime" defaultValue={settings.deliveryTime ?? ""} placeholder="e.g. 3–5 days" />
        <p className="mt-1 text-xs text-ink-500">Shown on product pages, the FAQ and the home page. Leave blank to hide.</p>
      </div>
      <div>
        <Label htmlFor="returnPolicy">Return Policy (one line)</Label>
        <Input id="returnPolicy" name="returnPolicy" defaultValue={settings.returnPolicy ?? ""} />
        <p className="mt-1 text-xs text-ink-500">Shown on product pages and the FAQ. Leave blank to hide.</p>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
        <input type="checkbox" name="codAvailable" defaultChecked={settings.codAvailable} className="h-4 w-4" />
        Cash on Delivery available
      </label>

      <div>
        <Label htmlFor="grievanceOfficerName">Grievance Officer Name</Label>
        <Input id="grievanceOfficerName" name="grievanceOfficerName" defaultValue={settings.grievanceOfficerName ?? ""} />
      </div>
      <div>
        <Label htmlFor="grievanceOfficerEmail">Grievance Officer Email</Label>
        <Input
          id="grievanceOfficerEmail"
          name="grievanceOfficerEmail"
          type="email"
          defaultValue={settings.grievanceOfficerEmail ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="instagramUrl">Instagram URL</Label>
        <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
      </div>
      <div>
        <Label htmlFor="facebookUrl">Facebook URL</Label>
        <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
      </div>
      <div>
        <Label htmlFor="youtubeUrl">YouTube URL</Label>
        <Input id="youtubeUrl" name="youtubeUrl" defaultValue={settings.youtubeUrl ?? ""} />
      </div>
      <div>
        <Label htmlFor="whatsappUrl">WhatsApp Link</Label>
        <Input id="whatsappUrl" name="whatsappUrl" defaultValue={settings.whatsappUrl ?? ""} />
      </div>

      <div>
        <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
        <Input id="taxPercentage" name="taxPercentage" type="number" step="0.01" defaultValue={settings.taxPercentage} />
      </div>
      <div>
        <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
        <Input
          id="freeShippingThreshold"
          name="freeShippingThreshold"
          type="number"
          step="0.01"
          defaultValue={settings.freeShippingThreshold ?? ""}
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="seoDefaultTitle">Default SEO Title</Label>
        <Input id="seoDefaultTitle" name="seoDefaultTitle" defaultValue={settings.seoDefaultTitle ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="seoDefaultDescription">Default SEO Description</Label>
        <Input id="seoDefaultDescription" name="seoDefaultDescription" defaultValue={settings.seoDefaultDescription ?? ""} />
      </div>

      {state.error && <p className="text-sm text-error sm:col-span-2">{state.error}</p>}
      {state.success && <p className="text-sm text-success sm:col-span-2">Settings saved.</p>}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
