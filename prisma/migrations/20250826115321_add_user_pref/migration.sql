-- CreateEnum
CREATE TYPE "public"."PoolSize" AS ENUM ('M25', 'M50');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "customAllures" TEXT[],
ADD COLUMN     "customDrills" TEXT[],
ADD COLUMN     "defaultTimeRepo" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "distanceDefault" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "poolSize" "public"."PoolSize" NOT NULL DEFAULT 'M25';
