-- CreateEnum
CREATE TYPE "public"."ExerciseCategory" AS ENUM ('ECHAUFFEMENT', 'RECUPERATION', 'REPETITION', 'FIN_DE_SEANCE');

-- CreateEnum
CREATE TYPE "public"."ExerciseUnit" AS ENUM ('DISTANCE', 'TEMPS');

-- CreateEnum
CREATE TYPE "public"."StrokeType" AS ENUM ('NAGE_LIBRE', 'BRASSE', 'CRAWL', 'DOS_CRAWLE', 'PAPILLON', 'QUATRE_NAGES', 'MIX', 'DRILLS', 'NON_DEFINI');

-- CreateTable
CREATE TABLE "public"."Workout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileId" TEXT,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Block" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "category" "public"."ExerciseCategory" NOT NULL,
    "unit" "public"."ExerciseUnit" NOT NULL,
    "value" INTEGER NOT NULL,
    "stroke" "public"."StrokeType" NOT NULL,
    "drill" TEXT,
    "details" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "public"."Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
