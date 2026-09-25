-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "skillLevels" "SkillLevel"[];

UPDATE "Team" SET "skillLevels" = ARRAY["skillLevel"];

ALTER TABLE "Team" DROP COLUMN "skillLevel";
