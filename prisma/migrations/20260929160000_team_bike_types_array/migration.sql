-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "bikeTypes" "BikeType"[];

UPDATE "Team" SET "bikeTypes" = ARRAY["bikeType"];

-- DropColumn
ALTER TABLE "Team" DROP COLUMN "bikeType";

-- CreateIndex
CREATE INDEX "Team_bikeTypes_idx" ON "Team" USING GIN ("bikeTypes");
