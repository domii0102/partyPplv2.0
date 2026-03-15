/*
  Warnings:

  - You are about to drop the column `imagePath` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `avatarPath` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nickname]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_postId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "imagePath";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "profileId" INTEGER,
ALTER COLUMN "postId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatarPath";

-- CreateIndex
CREATE UNIQUE INDEX "Image_profileId_key" ON "Image"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_eventId_key" ON "Image"("eventId");

-- CreateIndex
CREATE INDEX "Image_eventId_idx" ON "Image"("eventId");

-- CreateIndex
CREATE INDEX "Image_profileId_idx" ON "Image"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_nickname_key" ON "UserProfile"("nickname");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("postId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("profileId") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Image" ADD CONSTRAINT image_one_owner CHECK ( (postId IS NOT NULL)::int + (eventId IS NOT NULL)::int + (profileId IS NOT NULL)::int = 1 );
