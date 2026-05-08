-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "triggeredById" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "UserCredentials"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;
