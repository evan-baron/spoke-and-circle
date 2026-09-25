CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "PlaceKind" AS ENUM ('City', 'Zip');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "kind" "PlaceKind" NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "zip" TEXT,
    "label" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "landAreaSqMi" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Place_kind_label_idx" ON "Place"("kind", "label");

-- CreateIndex
CREATE INDEX "Place_kind_zip_idx" ON "Place"("kind", "zip");

-- CreateIndex
CREATE INDEX "Place_name_trgm_idx" ON "Place" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Team_latitude_longitude_idx" ON "Team"("latitude", "longitude");
