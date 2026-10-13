-- CreateEnum
CREATE TYPE "CookieConsentEvent" AS ENUM ('Granted', 'Withdrawn');

-- CreateTable
CREATE TABLE "CookieConsentLog" (
    "id" SERIAL NOT NULL,
    "visitorId" TEXT NOT NULL,
    "event" "CookieConsentEvent" NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CookieConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CookieConsentLog_visitorId_idx" ON "CookieConsentLog"("visitorId");

-- CreateIndex
CREATE INDEX "CookieConsentLog_createdAt_idx" ON "CookieConsentLog"("createdAt");
