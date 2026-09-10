"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface VariantRow {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  stock: string;
}

export const emptyVariantRow: VariantRow = { sku: "", color: "", size: "", price: "", stock: "" };

/**
 * Covers the two variant axes named throughout the spec (saree color, and
 * future clothing sizes S–XXL) with concrete inputs. The underlying
 * ProductVariant.attributes column is a free-form JSON object, so more axes
 * can be added later without a schema change — this editor just doesn't
 * expose them yet.
 */
export function VariantEditor({ variants, onChange }: { variants: VariantRow[]; onChange: (rows: VariantRow[]) => void }) {
  function updateRow(index: number, patch: Partial<VariantRow>) {
    onChange(variants.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Variants (optional — leave empty for a single-SKU product)</Label>
        <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...variants, { ...emptyVariantRow }])}>
          <Plus className="h-3.5 w-3.5" />
          Add Variant
        </Button>
      </div>

      {variants.length > 0 && (
        <div className="mt-2 space-y-2">
          {variants.map((row, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 rounded-sm border border-border p-3 sm:grid-cols-6">
              <Input placeholder="Color" value={row.color} onChange={(e) => updateRow(index, { color: e.target.value })} />
              <Input placeholder="Size" value={row.size} onChange={(e) => updateRow(index, { size: e.target.value })} />
              <Input placeholder="Variant SKU" value={row.sku} onChange={(e) => updateRow(index, { sku: e.target.value })} />
              <Input
                placeholder="Price"
                type="number"
                value={row.price}
                onChange={(e) => updateRow(index, { price: e.target.value })}
              />
              <Input
                placeholder="Stock"
                type="number"
                value={row.stock}
                onChange={(e) => updateRow(index, { stock: e.target.value })}
              />
              <button type="button" onClick={() => removeRow(index)} className="flex items-center justify-center text-error">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
