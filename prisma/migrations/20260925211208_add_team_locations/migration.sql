-- CreateTable
CREATE TABLE "TeamLocation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "TeamLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamLocation_teamId_idx" ON "TeamLocation"("teamId");

-- CreateIndex
CREATE INDEX "TeamLocation_state_idx" ON "TeamLocation"("state");

-- CreateIndex
CREATE INDEX "TeamLocation_latitude_longitude_idx" ON "TeamLocation"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "TeamLocation" ADD CONSTRAINT "TeamLocation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
