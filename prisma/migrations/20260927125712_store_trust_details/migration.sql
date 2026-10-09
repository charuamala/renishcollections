-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "codAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryTime" TEXT,
ADD COLUMN     "grievanceOfficerEmail" TEXT,
ADD COLUMN     "grievanceOfficerName" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "returnPolicy" TEXT,
ADD COLUMN     "supportHours" TEXT;
