CREATE TYPE "EBikePolicy" AS ENUM ('No', 'Yes', 'Sometimes');

ALTER TABLE "Team" ADD COLUMN "eBikePolicy" "EBikePolicy" NOT NULL DEFAULT 'No';

ALTER TABLE "Team" ADD COLUMN "eBikeNotes" TEXT;

UPDATE "Team" SET "eBikePolicy" = 'Yes' WHERE "eBikeAllowed" = true;

ALTER TABLE "Team" DROP COLUMN "eBikeAllowed";
