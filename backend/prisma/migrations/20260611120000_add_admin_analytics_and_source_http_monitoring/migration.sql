-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventName" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "path" TEXT,
    "referrer" TEXT,
    "metadata" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceHttpCheck" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ok" BOOLEAN NOT NULL,
    "statusCode" INTEGER,
    "responseTimeMs" INTEGER,
    "errorCategory" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "SourceHttpCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceIssue" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "reason" TEXT NOT NULL,
    "failureCount" INTEGER NOT NULL DEFAULT 1,
    "assignedTo" TEXT,
    "resolutionNote" TEXT,
    "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_entityType_idx" ON "AnalyticsEvent"("entityType");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SourceHttpCheck_sourceId_idx" ON "SourceHttpCheck"("sourceId");

-- CreateIndex
CREATE INDEX "SourceHttpCheck_checkedAt_idx" ON "SourceHttpCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "SourceHttpCheck_ok_idx" ON "SourceHttpCheck"("ok");

-- CreateIndex
CREATE INDEX "SourceHttpCheck_statusCode_idx" ON "SourceHttpCheck"("statusCode");

-- CreateIndex
CREATE INDEX "SourceHttpCheck_errorCategory_idx" ON "SourceHttpCheck"("errorCategory");

-- CreateIndex
CREATE INDEX "SourceIssue_sourceId_idx" ON "SourceIssue"("sourceId");

-- CreateIndex
CREATE INDEX "SourceIssue_status_idx" ON "SourceIssue"("status");

-- CreateIndex
CREATE INDEX "SourceIssue_severity_idx" ON "SourceIssue"("severity");

-- CreateIndex
CREATE INDEX "SourceIssue_lastDetectedAt_idx" ON "SourceIssue"("lastDetectedAt");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceHttpCheck" ADD CONSTRAINT "SourceHttpCheck_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TenderSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceIssue" ADD CONSTRAINT "SourceIssue_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TenderSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
