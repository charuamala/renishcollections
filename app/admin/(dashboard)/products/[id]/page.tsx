import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategoriesForSelect } from "@/services/admin/category.service";
import { getProductForAdmin } from "@/services/admin/product.service";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForAdmin(id), listCategoriesForSelect()]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">Edit Product</h1>
      <ProductForm
        product={{
          ...product,
          sellingPrice: product.sellingPrice.toString(),
          originalPrice: product.originalPrice.toString(),
          wholesalePrice: product.wholesalePrice?.toString() ?? null,
          variants: product.variants.map((v) => ({ ...v, price: v.price.toString() })),
        }}
        categories={categories}
      />
    </div>
  );
}
