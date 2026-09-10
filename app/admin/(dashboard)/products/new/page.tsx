import type { Metadata } from "next";
import { listCategoriesForSelect } from "@/services/admin/category.service";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Add Product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const categories = await listCategoriesForSelect();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
