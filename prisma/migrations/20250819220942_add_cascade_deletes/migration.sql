-- DropForeignKey
ALTER TABLE "public"."Block" DROP CONSTRAINT "Block_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Exercise" DROP CONSTRAINT "Exercise_blockId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "public"."Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
