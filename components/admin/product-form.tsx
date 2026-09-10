"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiImageUploader } from "@/components/admin/image-uploader";
import { VariantEditor, type VariantRow } from "@/components/admin/variant-editor";
import { createProductAction, updateProductAction } from "@/actions/admin/product.actions";
import type { ADMIN_PRODUCT_SELECT } from "@/services/admin/product.service";
import type { Prisma } from "@prisma/client";

type AdminProduct = Prisma.ProductGetPayload<{ select: typeof ADMIN_PRODUCT_SELECT }>;

/** AdminProduct with Decimal fields serialized to strings — Decimal instances can't cross the server/client boundary as props. */
export type SerializedAdminProduct = Omit<AdminProduct, "sellingPrice" | "originalPrice" | "wholesalePrice" | "variants"> & {
  sellingPrice: string;
  originalPrice: string;
  wholesalePrice: string | null;
  variants: (Omit<AdminProduct["variants"][number], "price"> & { price: string })[];
};

export function ProductForm({
  product,
  categories,
}: {
  product?: SerializedAdminProduct;
  categories: { id: string; name: string; parentName: string | null }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => {
      const attrs = (v.attributes ?? {}) as Record<string, string>;
      return { id: v.id, sku: v.sku, color: attrs.color ?? "", size: attrs.size ?? "", price: v.price, stock: String(v.stock) };
    }) ?? [],
  );

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      sku: formData.get("sku"),
      categoryId: formData.get("categoryId"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      sellingPrice: formData.get("sellingPrice"),
      originalPrice: formData.get("originalPrice"),
      wholesalePrice: formData.get("wholesalePrice") || undefined,
      stock: formData.get("stock") || 0,
      lowStockThreshold: formData.get("lowStockThreshold") || 5,
      fabric: formData.get("fabric"),
      color: formData.get("color"),
      sareeLength: formData.get("sareeLength"),
      blouseIncluded: formData.get("blouseIncluded") === "on",
      careInstructions: formData.get("careInstructions"),
      tags: formData.get("tags"),
      status: formData.get("status"),
      isFeatured: formData.get("isFeatured") === "on",
      isNewArrival: formData.get("isNewArrival") === "on",
      isBestSeller: formData.get("isBestSeller") === "on",
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      seoKeywords: formData.get("seoKeywords"),
      canonicalUrl: formData.get("canonicalUrl"),
      ogImageUrl: formData.get("ogImageUrl"),
      images,
      videoUrl: formData.get("videoUrl") || undefined,
      variants: variants
        .filter((v) => v.sku && v.price)
        .map((v) => ({ id: v.id, sku: v.sku, color: v.color || undefined, size: v.size || undefined, price: v.price, stock: v.stock || 0 })),
    };

    startTransition(async () => {
      const result = product ? await updateProductAction(product.id, payload) : await createProductAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
    });
  }

  return (
    <form action={handleSubmit} className="max-w-4xl space-y-8">
      <section className="grid grid-cols-1 gap-4 rounded-sm border border-border bg-white p-5 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-charcoal sm:col-span-2">Basic Information</h2>
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (auto-generated if blank)</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku} required />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId}
            required
            className="h-11 w-full rounded-sm border border-border bg-white px-3 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.parentName} / ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Full Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            rows={4}
            className="w-full rounded-sm border border-border bg-white p-3 text-sm"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-sm border border-border bg-white p-5 sm:grid-cols-3">
        <h2 className="text-sm font-semibold text-charcoal sm:col-span-3">Pricing & Inventory</h2>
        <div>
          <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
          <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" defaultValue={product?.sellingPrice} required />
        </div>
        <div>
          <Label htmlFor="originalPrice">Original Price (₹)</Label>
          <Input id="originalPrice" name="originalPrice" type="number" step="0.01" defaultValue={product?.originalPrice} required />
        </div>
        <div>
          <Label htmlFor="wholesalePrice">Wholesale / Cost Price (₹) — admin only</Label>
          <Input id="wholesalePrice" name="wholesalePrice" type="number" step="0.01" defaultValue={product?.wholesalePrice ?? ""} />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? 0} required />
        </div>
        <div>
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input id="lowStockThreshold" name="lowStockThreshold" type="number" defaultValue={product?.lowStockThreshold ?? 5} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-sm border border-border bg-white p-5 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-charcoal sm:col-span-2">Saree Attributes</h2>
        <div>
          <Label htmlFor="fabric">Fabric</Label>
          <Input id="fabric" name="fabric" defaultValue={product?.fabric ?? ""} />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" defaultValue={product?.color ?? ""} />
        </div>
        <div>
          <Label htmlFor="sareeLength">Saree Length</Label>
          <Input id="sareeLength" name="sareeLength" defaultValue={product?.sareeLength ?? ""} placeholder="e.g. 6.3 meters" />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink-600">
          <input type="checkbox" name="blouseIncluded" defaultChecked={product?.blouseIncluded ?? false} className="h-4 w-4" />
          Blouse Included
        </label>
        <div className="sm:col-span-2">
          <Label htmlFor="careInstructions">Care Instructions</Label>
          <Input id="careInstructions" name="careInstructions" defaultValue={product?.careInstructions ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" defaultValue={product?.tags.join(", ") ?? ""} placeholder="silk, wedding, maroon" />
        </div>
      </section>

      <section className="space-y-4 rounded-sm border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-charcoal">Media</h2>
        <MultiImageUploader images={images} onChange={setImages} />
        <div>
          <Label htmlFor="videoUrl">Product Video URL (optional)</Label>
          <Input id="videoUrl" name="videoUrl" defaultValue={product?.videos[0]?.url ?? ""} placeholder="https://..." />
        </div>
      </section>

      <section className="rounded-sm border border-border bg-white p-5">
        <VariantEditor variants={variants} onChange={setVariants} />
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-sm border border-border bg-white p-5 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-charcoal sm:col-span-2">Status & Visibility</h2>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? "DRAFT"}
            className="h-11 w-full rounded-sm border border-border bg-white px-3 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} className="h-4 w-4" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" name="isNewArrival" defaultChecked={product?.isNewArrival} className="h-4 w-4" />
            New Arrival
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" name="isBestSeller" defaultChecked={product?.isBestSeller} className="h-4 w-4" />
            Best Seller
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-sm border border-border bg-white p-5 sm:grid-cols-2">
        <h2 className="text-sm font-semibold text-charcoal sm:col-span-2">SEO</h2>
        <div>
          <Label htmlFor="seoTitle">SEO Title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
        </div>
        <div>
          <Label htmlFor="seoKeywords">SEO Keywords</Label>
          <Input id="seoKeywords" name="seoKeywords" defaultValue={product?.seoKeywords ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="seoDescription">SEO Description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={product?.seoDescription ?? ""} />
        </div>
        <div>
          <Label htmlFor="canonicalUrl">Canonical URL (optional override)</Label>
          <Input id="canonicalUrl" name="canonicalUrl" defaultValue={product?.canonicalUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor="ogImageUrl">Open Graph Image URL (optional override)</Label>
          <Input id="ogImageUrl" name="ogImageUrl" defaultValue={product?.ogImageUrl ?? ""} />
        </div>
      </section>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
