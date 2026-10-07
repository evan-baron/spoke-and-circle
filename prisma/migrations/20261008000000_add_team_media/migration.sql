CREATE TABLE "TeamMedia" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamMedia_publicId_key" ON "TeamMedia"("publicId");

CREATE INDEX "TeamMedia_teamId_idx" ON "TeamMedia"("teamId");

ALTER TABLE "TeamMedia" ADD CONSTRAINT "TeamMedia_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
