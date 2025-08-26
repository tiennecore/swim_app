/*
  Warnings:

  - The primary key for the `Block` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `repetitions` on the `Block` table. All the data in the column will be lost.
  - The `id` column on the `Block` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Exercise` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `breathingRhythm` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `stroke` on the `Exercise` table. All the data in the column will be lost.
  - The `id` column on the `Exercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unit` column on the `Exercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `anonymousId` on the `Like` table. All the data in the column will be lost.
  - The `id` column on the `Like` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileId` column on the `Like` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Workout` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `creatorName` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `workoutType` on the `Workout` table. All the data in the column will be lost.
  - The `id` column on the `Workout` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileId` column on the `Workout` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CustomBreathingRhythm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomEquipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `workoutId` on the `Block` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Exercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `blockId` on the `Exercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Block" DROP CONSTRAINT "Block_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomBreathingRhythm" DROP CONSTRAINT "CustomBreathingRhythm_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomEquipment" DROP CONSTRAINT "CustomEquipment_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Exercise" DROP CONSTRAINT "Exercise_blockId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Workout" DROP CONSTRAINT "Workout_profileId_fkey";

-- DropIndex
DROP INDEX "public"."Like_anonymousId_workoutSignature_key";

-- AlterTable
ALTER TABLE "public"."Block" DROP CONSTRAINT "Block_pkey",
DROP COLUMN "name",
DROP COLUMN "repetitions",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "workoutId",
ADD COLUMN     "workoutId" UUID NOT NULL,
ADD CONSTRAINT "Block_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Exercise" DROP CONSTRAINT "Exercise_pkey",
DROP COLUMN "breathingRhythm",
DROP COLUMN "intensity",
DROP COLUMN "stroke",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "repetitions" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
DROP COLUMN "unit",
ADD COLUMN     "unit" TEXT,
ALTER COLUMN "value" DROP NOT NULL,
ALTER COLUMN "details" DROP NOT NULL,
DROP COLUMN "blockId",
ADD COLUMN     "blockId" UUID NOT NULL,
ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "anonymousId",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workoutId" UUID,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Workout" DROP CONSTRAINT "Workout_pkey",
DROP COLUMN "creatorName",
DROP COLUMN "name",
DROP COLUMN "workoutType",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "profileId",
ADD COLUMN     "profileId" UUID,
ADD CONSTRAINT "Workout_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."CustomBreathingRhythm";

-- DropTable
DROP TABLE "public"."CustomEquipment";

-- DropTable
DROP TABLE "public"."profiles";

-- DropEnum
DROP TYPE "public"."ExerciseCategory";

-- DropEnum
DROP TYPE "public"."ExerciseUnit";

-- DropEnum
DROP TYPE "public"."Intensity";

-- DropEnum
DROP TYPE "public"."StrokeType";

-- DropEnum
DROP TYPE "public"."WorkoutType";

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" UUID NOT NULL,
    "name" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_profileId_idx" ON "public"."Like"("profileId");

-- CreateIndex
CREATE INDEX "Like_workoutId_idx" ON "public"."Like"("workoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_profileId_workoutSignature_key" ON "public"."Like"("profileId", "workoutSignature");

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "public"."Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
