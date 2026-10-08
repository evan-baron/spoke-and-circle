ALTER TABLE "Team" DROP CONSTRAINT "Team_submittedById_fkey";
ALTER TABLE "TeamClaim" DROP CONSTRAINT "TeamClaim_userId_fkey";

ALTER TABLE "User" ADD COLUMN "uuid" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "Team" ADD COLUMN "submittedByUuid" UUID;
ALTER TABLE "TeamClaim" ADD COLUMN "userUuid" UUID;

UPDATE "Team" SET "submittedByUuid" = "User"."uuid" FROM "User" WHERE "Team"."submittedById" = "User"."id";
UPDATE "TeamClaim" SET "userUuid" = "User"."uuid" FROM "User" WHERE "TeamClaim"."userId" = "User"."id";
ALTER TABLE "TeamClaim" ALTER COLUMN "userUuid" SET NOT NULL;

DROP INDEX "TeamClaim_userId_idx";
ALTER TABLE "Team" DROP COLUMN "submittedById";
ALTER TABLE "TeamClaim" DROP COLUMN "userId";
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";
ALTER TABLE "User" DROP COLUMN "id";

ALTER TABLE "User" RENAME COLUMN "uuid" TO "id";
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "Team" RENAME COLUMN "submittedByUuid" TO "submittedById";
ALTER TABLE "TeamClaim" RENAME COLUMN "userUuid" TO "userId";

CREATE INDEX "TeamClaim_userId_idx" ON "TeamClaim"("userId");
ALTER TABLE "Team" ADD CONSTRAINT "Team_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamClaim" ADD CONSTRAINT "TeamClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DELETE FROM "RateLimit" WHERE "identifier" LIKE 'user:%';
