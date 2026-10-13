/*
  Warnings:

  - The `segmentation` column on the `Team` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "segmentation",
ADD COLUMN     "segmentation" TEXT;

-- DropEnum
DROP TYPE "Segmentation";
