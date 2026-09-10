"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";
import { deleteCategoryAction, toggleCategoryPublishedAction } from "@/actions/admin/category.actions";
import type { Category } from "@prisma/client";

type CategoryWithMeta = Category & {
  parent: { name: string } | null;
  _count: { products: number; children: number };
};

export function CategoryList({ categories }: { categories: CategoryWithMeta[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parentOptions = categories.filter((c) => !c.parentId).map((c) => ({ id: c.id, name: c.name }));

  function handleDelete(id: string) {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.error) setDeleteError(result.error);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-charcoal">Categories</h1>
        <Button type="button" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <div className="mt-4 rounded-sm border border-border bg-white p-4">
          <CategoryForm parentOptions={parentOptions} onSaved={() => setShowAddForm(false)} />
        </div>
      )}

      {deleteError && <p className="mt-4 text-sm text-error">{deleteError}</p>}

      <div className="mt-6 space-y-3">
        {categories.map((category) =>
          editingId === category.id ? (
            <div key={category.id} className="rounded-sm border border-border bg-white p-4">
              <CategoryForm category={category} parentOptions={parentOptions} onSaved={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={category.id} className="flex items-center justify-between rounded-sm border border-border bg-white p-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    {category.parent && <span className="text-ink-400">{category.parent.name} / </span>}
                    {category.name}
                  </p>
                  <p className="text-xs text-ink-400">
                    /{category.slug} · {category._count.products} products · {category._count.children} subcategories
                  </p>
                </div>
                <Badge variant={category.isPublished ? "success" : "outline"}>
                  {category.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs text-ink-600 hover:text-maroon-600"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => toggleCategoryPublishedAction(category.id, !category.isPublished))
                  }
                >
                  {category.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button type="button" aria-label="Edit" onClick={() => setEditingId(category.id)}>
                  <Pencil className="h-4 w-4 text-ink-600 hover:text-maroon-600" />
                </button>
                <button type="button" aria-label="Delete" disabled={isPending} onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4 text-ink-600 hover:text-error" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
