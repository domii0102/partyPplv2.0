-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentId" INTEGER;

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedEventId" INTEGER,
    "relatedPostId" INTEGER,
    "relatedCommentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserCredentials"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
