-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "relatedInvitationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_relatedInvitationId_fkey" FOREIGN KEY ("relatedInvitationId") REFERENCES "Invitation"("invitationId") ON DELETE SET NULL ON UPDATE CASCADE;
