/*
  Warnings:

  - The values [REPETITION] on the enum `ExerciseCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Intensity" AS ENUM ('APPLIQUE', 'LENT', 'ENDURANCE', 'RAPIDE', 'SPRINT');

-- CreateEnum
CREATE TYPE "public"."Equipment" AS ENUM ('PALMES', 'TUBA', 'PULL_BUOY', 'PLAQUETTES', 'PLANCHES');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ExerciseCategory_new" AS ENUM ('ECHAUFFEMENT', 'EXERCICE', 'RECUPERATION', 'FIN_DE_SEANCE');
ALTER TABLE "public"."Exercise" ALTER COLUMN "category" TYPE "public"."ExerciseCategory_new" USING ("category"::text::"public"."ExerciseCategory_new");
ALTER TYPE "public"."ExerciseCategory" RENAME TO "ExerciseCategory_old";
ALTER TYPE "public"."ExerciseCategory_new" RENAME TO "ExerciseCategory";
DROP TYPE "public"."ExerciseCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Exercise" ADD COLUMN     "breathingRhythm" INTEGER,
ADD COLUMN     "equipment" TEXT[],
ADD COLUMN     "intensity" "public"."Intensity" NOT NULL DEFAULT 'ENDURANCE';

-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "defaultDistance" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "defaultPoolLength" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "defaultRestTime" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "public"."CustomEquipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "CustomEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomBreathingRhythm" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "CustomBreathingRhythm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CustomEquipment" ADD CONSTRAINT "CustomEquipment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomBreathingRhythm" ADD CONSTRAINT "CustomBreathingRhythm_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
