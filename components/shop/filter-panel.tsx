import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CurrentFilterParams {
  q?: string;
  category: string[];
  color: string[];
  fabric: string[];
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}

export function FilterPanel({
  categories,
  colors,
  fabrics,
  currentParams,
}: {
  categories: { id: string; name: string }[];
  colors: string[];
  fabrics: string[];
  currentParams: CurrentFilterParams;
}) {
  return (
    <form method="get" action="/shop" className="flex flex-col gap-6">
      {currentParams.q && <input type="hidden" name="q" value={currentParams.q} />}

      {categories.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-charcoal">Category</legend>
          <div className="mt-2 space-y-1.5">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-ink-600">
                <input
                  type="checkbox"
                  name="category"
                  value={c.id}
                  defaultChecked={currentParams.category.includes(c.id)}
                  className="h-4 w-4 rounded border-border text-maroon-600 focus-visible:outline-2"
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="text-sm font-semibold text-charcoal">Price</legend>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            defaultValue={currentParams.minPrice}
            className="h-9 w-full rounded-sm border border-border px-2 text-sm"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            defaultValue={currentParams.maxPrice}
            className="h-9 w-full rounded-sm border border-border px-2 text-sm"
          />
        </div>
      </fieldset>

      {colors.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-charcoal">Color</legend>
          <div className="mt-2 space-y-1.5">
            {colors.map((color) => (
              <label key={color} className="flex items-center gap-2 text-sm text-ink-600">
                <input
                  type="checkbox"
                  name="color"
                  value={color}
                  defaultChecked={currentParams.color.includes(color)}
                  className="h-4 w-4 rounded border-border text-maroon-600"
                />
                {color}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {fabrics.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-charcoal">Fabric</legend>
          <div className="mt-2 space-y-1.5">
            {fabrics.map((fabric) => (
              <label key={fabric} className="flex items-center gap-2 text-sm text-ink-600">
                <input
                  type="checkbox"
                  name="fabric"
                  value={fabric}
                  defaultChecked={currentParams.fabric.includes(fabric)}
                  className="h-4 w-4 rounded border-border text-maroon-600"
                />
                {fabric}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input
          type="checkbox"
          name="inStock"
          value="1"
          defaultChecked={currentParams.inStock === "1"}
          className="h-4 w-4 rounded border-border text-maroon-600"
        />
        In stock only
      </label>

      <Button type="submit" variant="primary" size="sm">
        Apply Filters
      </Button>
      <Link href="/shop" className="text-center text-xs text-ink-400 hover:underline">
        Clear all filters
      </Link>
    </form>
  );
}
