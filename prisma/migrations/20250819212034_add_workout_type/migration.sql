-- CreateEnum
CREATE TYPE "public"."WorkoutType" AS ENUM ('ENDURANCE', 'VITESSE_PUISSANCE', 'TECHNIQUE', 'RECUPERATION', 'MIXTE');

-- AlterTable
ALTER TABLE "public"."Workout" ADD COLUMN     "workoutType" "public"."WorkoutType";
