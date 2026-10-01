-- CreateEnum
CREATE TYPE "RacingDiscipline" AS ENUM ('Road Race', 'Criterium', 'Time Trial', 'Stage Race', 'Hill Climb', 'Gravel Race', 'Cyclocross', 'Track', 'Cross-Country', 'Cross-Country Marathon', 'Short Track', 'Downhill', 'Enduro', 'Dual Slalom', 'Four-Cross', 'Slopestyle', 'BMX Racing', 'Freestyle', 'Endurance', 'Triathlon', 'Virtual Racing');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "racingDisciplines" "RacingDiscipline"[] DEFAULT ARRAY[]::"RacingDiscipline"[];
