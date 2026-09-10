import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";

const SETTINGS_ID = "singleton";

/** Site settings are a single row, created on first read if missing. Upsert keeps this race-safe under concurrent callers (e.g. parallel build workers). */
export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID, storeName: SITE_NAME },
  });
}

export async function updateSiteSettings(data: Parameters<typeof prisma.siteSettings.update>[0]["data"]) {
  await getSiteSettings();
  return prisma.siteSettings.update({ where: { id: SETTINGS_ID }, data });
}
