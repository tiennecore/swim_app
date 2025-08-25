-- CreateTable
CREATE TABLE "public"."Like" (
    "id" TEXT NOT NULL,
    "workoutSignature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT,
    "anonymousId" TEXT,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_profileId_workoutSignature_key" ON "public"."Like"("profileId", "workoutSignature");

-- CreateIndex
CREATE UNIQUE INDEX "Like_anonymousId_workoutSignature_key" ON "public"."Like"("anonymousId", "workoutSignature");

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
