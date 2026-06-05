-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "ocid" TEXT NOT NULL,
    "slug" TEXT,
    "tenderNumber" TEXT,
    "referenceNumber" TEXT,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "category" TEXT,
    "region" TEXT,
    "province" TEXT,
    "closingDate" TIMESTAMP(3),
    "briefingDate" TIMESTAMP(3),
    "briefingVenue" TEXT,
    "briefingCompulsory" BOOLEAN NOT NULL DEFAULT false,
    "buyerName" TEXT,
    "buyerType" TEXT,
    "municipality" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'ZAR',
    "eligibilityCriteria" TEXT,
    "specialConditions" TEXT,
    "submissionMethod" TEXT,
    "submissionAddress" TEXT,
    "documentUrls" TEXT,
    "sourceName" TEXT,
    "sourceType" TEXT,
    "sourceUrl" TEXT,
    "sourceHash" TEXT,
    "rawHtmlHash" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "rawData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "invitedEmail" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'invited',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "alertFrequency" TEXT NOT NULL DEFAULT 'daily',
    "lastAlertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "bookmarkId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "tenderUrl" TEXT NOT NULL,
    "province" TEXT,
    "organisationName" TEXT,
    "scrapeMethod" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scrapeFrequencyHours" INTEGER NOT NULL DEFAULT 24,
    "scrapeFrequencyMinutes" INTEGER NOT NULL DEFAULT 1440,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalScrapeRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "numberOfTendersFound" INTEGER NOT NULL DEFAULT 0,
    "numberOfTendersCreated" INTEGER NOT NULL DEFAULT 0,
    "numberOfTendersUpdated" INTEGER NOT NULL DEFAULT 0,
    "numberOfDuplicatesFound" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "pagesVisited" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExternalScrapeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalScrapeError" (
    "id" TEXT NOT NULL,
    "runId" TEXT,
    "sourceId" TEXT,
    "sourceName" TEXT,
    "url" TEXT,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalScrapeError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalTenderChangeLog" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "sourceId" TEXT,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalTenderChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tender_ocid_key" ON "Tender"("ocid");

-- CreateIndex
CREATE UNIQUE INDEX "Tender_slug_key" ON "Tender"("slug");

-- CreateIndex
CREATE INDEX "Tender_status_idx" ON "Tender"("status");

-- CreateIndex
CREATE INDEX "Tender_closingDate_idx" ON "Tender"("closingDate");

-- CreateIndex
CREATE INDEX "Tender_buyerName_idx" ON "Tender"("buyerName");

-- CreateIndex
CREATE INDEX "Tender_category_idx" ON "Tender"("category");

-- CreateIndex
CREATE INDEX "Tender_region_idx" ON "Tender"("region");

-- CreateIndex
CREATE INDEX "Tender_province_idx" ON "Tender"("province");

-- CreateIndex
CREATE INDEX "Tender_publishedDate_idx" ON "Tender"("publishedDate");

-- CreateIndex
CREATE INDEX "Tender_slug_idx" ON "Tender"("slug");

-- CreateIndex
CREATE INDEX "Tender_tenderNumber_idx" ON "Tender"("tenderNumber");

-- CreateIndex
CREATE INDEX "Tender_referenceNumber_idx" ON "Tender"("referenceNumber");

-- CreateIndex
CREATE INDEX "Tender_sourceUrl_idx" ON "Tender"("sourceUrl");

-- CreateIndex
CREATE INDEX "Tender_sourceHash_idx" ON "Tender"("sourceHash");

-- CreateIndex
CREATE INDEX "Award_tenderId_idx" ON "Award"("tenderId");

-- CreateIndex
CREATE INDEX "Award_supplierName_idx" ON "Award"("supplierName");

-- CreateIndex
CREATE UNIQUE INDEX "Award_tenderId_supplierName_key" ON "Award"("tenderId", "supplierName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_status_idx" ON "OrganizationMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_invitedEmail_key" ON "OrganizationMember"("organizationId", "invitedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_tenderId_idx" ON "Bookmark"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_tenderId_key" ON "Bookmark"("userId", "tenderId");

-- CreateIndex
CREATE INDEX "TenderNote_userId_idx" ON "TenderNote"("userId");

-- CreateIndex
CREATE INDEX "TenderNote_tenderId_idx" ON "TenderNote"("tenderId");

-- CreateIndex
CREATE INDEX "TenderNote_bookmarkId_idx" ON "TenderNote"("bookmarkId");

-- CreateIndex
CREATE INDEX "TenderSource_active_idx" ON "TenderSource"("active");

-- CreateIndex
CREATE INDEX "TenderSource_sourceType_idx" ON "TenderSource"("sourceType");

-- CreateIndex
CREATE INDEX "TenderSource_province_idx" ON "TenderSource"("province");

-- CreateIndex
CREATE INDEX "ExternalScrapeRun_sourceId_idx" ON "ExternalScrapeRun"("sourceId");

-- CreateIndex
CREATE INDEX "ExternalScrapeRun_status_idx" ON "ExternalScrapeRun"("status");

-- CreateIndex
CREATE INDEX "ExternalScrapeRun_startedAt_idx" ON "ExternalScrapeRun"("startedAt");

-- CreateIndex
CREATE INDEX "ExternalScrapeError_runId_idx" ON "ExternalScrapeError"("runId");

-- CreateIndex
CREATE INDEX "ExternalScrapeError_sourceId_idx" ON "ExternalScrapeError"("sourceId");

-- CreateIndex
CREATE INDEX "ExternalScrapeError_createdAt_idx" ON "ExternalScrapeError"("createdAt");

-- CreateIndex
CREATE INDEX "ExternalTenderChangeLog_tenderId_idx" ON "ExternalTenderChangeLog"("tenderId");

-- CreateIndex
CREATE INDEX "ExternalTenderChangeLog_sourceId_idx" ON "ExternalTenderChangeLog"("sourceId");

-- CreateIndex
CREATE INDEX "ExternalTenderChangeLog_createdAt_idx" ON "ExternalTenderChangeLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderNote" ADD CONSTRAINT "TenderNote_bookmarkId_fkey" FOREIGN KEY ("bookmarkId") REFERENCES "Bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalScrapeRun" ADD CONSTRAINT "ExternalScrapeRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TenderSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalScrapeError" ADD CONSTRAINT "ExternalScrapeError_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ExternalScrapeRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
