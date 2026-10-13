/*
  Warnings:

  - You are about to drop the column `codeOfConduct` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `rideDays` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `rideSchedule` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `seasons` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `startTimes` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "codeOfConduct",
DROP COLUMN "rideDays",
DROP COLUMN "rideSchedule",
DROP COLUMN "seasons",
DROP COLUMN "startTimes";
