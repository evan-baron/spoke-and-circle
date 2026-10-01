-- AlterTable
ALTER TABLE "Team" DROP COLUMN "visibility",
DROP COLUMN "rideVisibility";

-- DropEnum
DROP TYPE "Visibility";
