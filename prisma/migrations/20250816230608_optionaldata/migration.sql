-- AlterTable
ALTER TABLE "public"."Exercise" ALTER COLUMN "intensity" DROP NOT NULL,
ALTER COLUMN "intensity" DROP DEFAULT;

-- DropEnum
DROP TYPE "public"."Equipment";
