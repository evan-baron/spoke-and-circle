-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "TeamClaim" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'Pending',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamClaim_status_createdAt_idx" ON "TeamClaim"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TeamClaim_teamId_status_idx" ON "TeamClaim"("teamId", "status");

-- CreateIndex
CREATE INDEX "TeamClaim_userId_idx" ON "TeamClaim"("userId");

-- AddForeignKey
ALTER TABLE "TeamClaim" ADD CONSTRAINT "TeamClaim_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamClaim" ADD CONSTRAINT "TeamClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

