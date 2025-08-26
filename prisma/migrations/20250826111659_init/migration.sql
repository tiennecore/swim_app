-- CreateEnum
CREATE TYPE "public"."WorkoutType" AS ENUM ('ENDURANCE', 'VITESSE_PUISSANCE', 'TECHNIQUE', 'RECUPERATION', 'MIXTE');

-- CreateEnum
CREATE TYPE "public"."ExerciseType" AS ENUM ('ECHAUFFEMENT', 'EXERCICE', 'RECUPERATION', 'RETOUR_AU_CALME');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" UUID NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workout" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" UUID NOT NULL,
    "workoutType" "public"."WorkoutType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Block" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workoutId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "blockId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "value" INTEGER,
    "unit" TEXT,
    "repetitions" INTEGER,
    "duration" INTEGER,
    "drill" TEXT,
    "equipment" TEXT[],
    "details" TEXT,
    "type" "public"."ExerciseType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" UUID,
    "workoutId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "Workout_profileId_idx" ON "public"."Workout"("profileId");

-- CreateIndex
CREATE INDEX "Workout_createdAt_idx" ON "public"."Workout"("createdAt");

-- CreateIndex
CREATE INDEX "Block_workoutId_idx" ON "public"."Block"("workoutId");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "public"."Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_blockId_idx" ON "public"."Exercise"("blockId");

-- CreateIndex
CREATE INDEX "Like_workoutId_idx" ON "public"."Like"("workoutId");

-- CreateIndex
CREATE INDEX "Like_profileId_idx" ON "public"."Like"("profileId");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Block" ADD CONSTRAINT "Block_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "public"."Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
