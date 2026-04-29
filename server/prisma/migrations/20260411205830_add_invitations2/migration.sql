-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_receiverId_fkey";

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "receiverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "UserCredentials"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
