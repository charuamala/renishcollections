import type { Metadata } from "next";
import { listBannersForAdmin } from "@/services/banner.service";
import { BannerList } from "@/components/admin/banner-list";

export const metadata: Metadata = {
  title: "Banners",
  robots: { index: false, follow: false },
};

export default async function AdminBannersPage() {
  const banners = await listBannersForAdmin();
  return <BannerList banners={banners} />;
}
