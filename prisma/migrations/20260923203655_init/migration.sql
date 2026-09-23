-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('Team', 'Club', 'Group Ride', 'Youth Program', 'Organization');

-- CreateEnum
CREATE TYPE "BikeType" AS ENUM ('Road', 'Gravel', 'MTB', 'Track', 'Tri', 'E-bike', 'Mixed');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('In-person', 'Virtual', 'Hybrid');

-- CreateEnum
CREATE TYPE "VirtualPlatform" AS ENUM ('Zwift', 'Strava', 'TrainerRoad', 'Other');

-- CreateEnum
CREATE TYPE "Pace" AS ENUM ('Casual', 'Steady', 'Competitive');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- CreateEnum
CREATE TYPE "MtbDiscipline" AS ENUM ('Cross-country', 'Trail', 'Enduro', 'Downhill', 'All-mountain');

-- CreateEnum
CREATE TYPE "Segmentation" AS ENUM ('A Group', 'B Group', 'C Group', 'N/A');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('Weekly', 'Monthly', 'Annually');

-- CreateEnum
CREATE TYPE "DropPolicy" AS ENUM ('Drop', 'No-drop');

-- CreateEnum
CREATE TYPE "RankingSystem" AS ENUM ('Captains', 'Ride Leaders', 'Liaison', 'N/A');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "CompetitiveOrCasual" AS ENUM ('Competitive', 'Casual');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'Pending',
    "submittedById" INTEGER,
    "name" TEXT NOT NULL,
    "type" "ClubType" NOT NULL,
    "missionStatement" TEXT,
    "codeOfConduct" TEXT,
    "affiliation" TEXT,
    "location" TEXT NOT NULL,
    "additionalLocations" TEXT[],
    "founded" INTEGER,
    "visibility" "Visibility" NOT NULL DEFAULT 'Public',
    "primaryLanguage" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveYear" INTEGER,
    "bikeType" "BikeType" NOT NULL,
    "discipline" "MtbDiscipline",
    "eBikeAllowed" BOOLEAN NOT NULL DEFAULT false,
    "format" "Format" NOT NULL,
    "virtualPlatforms" "VirtualPlatform"[],
    "homeBaseAffiliation" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "strava" TEXT,
    "discord" TEXT,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "personaRestrictions" TEXT[],
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "memberLimit" INTEGER,
    "waitlist" BOOLEAN NOT NULL DEFAULT false,
    "howToJoin" TEXT,
    "rideSchedule" "ScheduleFrequency",
    "startTimes" TEXT[],
    "pace" "Pace",
    "segmentation" "Segmentation",
    "typicalDistanceMiles" INTEGER,
    "typicalElevationGainFt" INTEGER,
    "dropPolicy" "DropPolicy",
    "rideVisibility" "Visibility" NOT NULL DEFAULT 'Public',
    "competitiveOrCasual" "CompetitiveOrCasual" NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "instructional" BOOLEAN NOT NULL DEFAULT false,
    "duesRequired" BOOLEAN NOT NULL DEFAULT false,
    "duesAmount" TEXT,
    "duesSchedule" "ScheduleFrequency",
    "requiredRides" BOOLEAN NOT NULL DEFAULT false,
    "requiredRaces" INTEGER,
    "mileageMin" INTEGER,
    "mileageFrequency" "ScheduleFrequency",
    "requiredKit" BOOLEAN NOT NULL DEFAULT false,
    "rankingSystem" "RankingSystem" NOT NULL DEFAULT 'N/A',
    "hasRoster" BOOLEAN NOT NULL DEFAULT false,
    "sponsors" TEXT[],
    "eventTypes" TEXT[],
    "joinTryouts" BOOLEAN NOT NULL DEFAULT false,
    "joinReferral" BOOLEAN NOT NULL DEFAULT false,
    "joinInviteOnly" BOOLEAN NOT NULL DEFAULT false,
    "joinOpen" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Id_key" ON "User"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "Team_status_idx" ON "Team"("status");

-- CreateIndex
CREATE INDEX "Team_bikeType_idx" ON "Team"("bikeType");

-- CreateIndex
CREATE INDEX "Team_location_idx" ON "Team"("location");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
