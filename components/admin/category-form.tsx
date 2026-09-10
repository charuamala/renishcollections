"use client";

import { useActionState, useState, useEffect } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createCategoryAction, updateCategoryAction, type CategoryFormState } from "@/actions/admin/category.actions";
import type { Category } from "@prisma/client";

const initialState: CategoryFormState = {};

export function CategoryForm({
  category,
  parentOptions,
  onSaved,
}: {
  category?: Category;
  parentOptions: { id: string; name: string }[];
  onSaved?: () => void;
}) {
  const action = category ? updateCategoryAction.bind(null, category.id) : createCategoryAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [imageUrl, setImageUrl] = useState<string | null>(category?.imageUrl ?? null);

  useEffect(() => {
    if (state.success) onSaved?.();
  }, [state.success, onSaved]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />

      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>
      <div>
        <Label htmlFor="slug">Slug (auto-generated if blank)</Label>
        <Input id="slug" name="slug" defaultValue={category?.slug} placeholder="e.g. silk-sarees" />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          className="w-full rounded-sm border border-border bg-white p-3 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="parentId">Parent Category</Label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className="h-11 w-full rounded-sm border border-border bg-white px-3 text-sm"
        >
          <option value="">— None (top-level) —</option>
          {parentOptions
            .filter((p) => p.id !== category?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input id="displayOrder" name="displayOrder" type="number" defaultValue={category?.displayOrder ?? 0} />
      </div>

      <div className="sm:col-span-2">
        <ImageUploader value={imageUrl} onChange={setImageUrl} label="Category Image" />
      </div>

      <div>
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Input id="seoTitle" name="seoTitle" defaultValue={category?.seoTitle ?? ""} />
      </div>
      <div>
        <Label htmlFor="seoDescription">SEO Description</Label>
        <Input id="seoDescription" name="seoDescription" defaultValue={category?.seoDescription ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
        <input type="checkbox" name="isPublished" defaultChecked={category?.isPublished ?? true} className="h-4 w-4" />
        Published (visible on the storefront)
      </label>

      {state.error && <p className="text-sm text-error sm:col-span-2">{state.error}</p>}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
