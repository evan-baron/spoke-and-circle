-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "deleteAfter" TIMESTAMP(3),
ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Team_deleteAfter_idx" ON "Team"("deleteAfter");
