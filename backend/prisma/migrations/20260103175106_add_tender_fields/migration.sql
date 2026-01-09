/*
  Warnings:

  - A unique constraint covering the columns `[tenderId,supplierName]` on the table `Award` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ocid" TEXT NOT NULL,
    "slug" TEXT,
    "publishedDate" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "category" TEXT,
    "region" TEXT,
    "province" TEXT,
    "closingDate" DATETIME,
    "briefingDate" DATETIME,
    "briefingVenue" TEXT,
    "briefingCompulsory" BOOLEAN NOT NULL DEFAULT false,
    "buyerName" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "estimatedValue" REAL,
    "currency" TEXT DEFAULT 'ZAR',
    "eligibilityCriteria" TEXT,
    "specialConditions" TEXT,
    "submissionMethod" TEXT,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tender" ("briefingDate", "buyerName", "category", "closingDate", "createdAt", "description", "id", "ocid", "publishedDate", "rawData", "region", "status", "title", "updatedAt") SELECT "briefingDate", "buyerName", "category", "closingDate", "createdAt", "description", "id", "ocid", "publishedDate", "rawData", "region", "status", "title", "updatedAt" FROM "Tender";
DROP TABLE "Tender";
ALTER TABLE "new_Tender" RENAME TO "Tender";
CREATE UNIQUE INDEX "Tender_ocid_key" ON "Tender"("ocid");
CREATE UNIQUE INDEX "Tender_slug_key" ON "Tender"("slug");
CREATE INDEX "Tender_status_idx" ON "Tender"("status");
CREATE INDEX "Tender_closingDate_idx" ON "Tender"("closingDate");
CREATE INDEX "Tender_buyerName_idx" ON "Tender"("buyerName");
CREATE INDEX "Tender_category_idx" ON "Tender"("category");
CREATE INDEX "Tender_region_idx" ON "Tender"("region");
CREATE INDEX "Tender_province_idx" ON "Tender"("province");
CREATE INDEX "Tender_publishedDate_idx" ON "Tender"("publishedDate");
CREATE INDEX "Tender_slug_idx" ON "Tender"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Award_tenderId_supplierName_key" ON "Award"("tenderId", "supplierName");
