-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "affiliatedId" TEXT;

-- CreateIndex
CREATE INDEX "Team_affiliatedId_idx" ON "Team"("affiliatedId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_affiliatedId_fkey" FOREIGN KEY ("affiliatedId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
