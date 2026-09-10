import type { Metadata } from "next";
import { listAllCategoriesForAdmin } from "@/services/admin/category.service";
import { CategoryList } from "@/components/admin/category-list";

export const metadata: Metadata = {
  title: "Manage Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await listAllCategoriesForAdmin();
  return <CategoryList categories={categories} />;
}
