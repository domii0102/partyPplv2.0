/*
  Warnings:

  - You are about to drop the column `imagePath` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `avatarPath` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `imageId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "imagePath",
ADD COLUMN     "imageId" VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatarPath",
ADD COLUMN     "avatarId" TEXT;
