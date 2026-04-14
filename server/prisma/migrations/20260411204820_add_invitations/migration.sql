/*
  Warnings:

  - You are about to drop the column `isAccepted` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `isExpired` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "isAccepted",
DROP COLUMN "isExpired",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
