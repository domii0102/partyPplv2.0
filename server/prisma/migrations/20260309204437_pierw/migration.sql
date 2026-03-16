/*
  Warnings:

  - You are about to drop the `AccessToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventGuest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Forum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hashtag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCredentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventHashtags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccessToken" DROP CONSTRAINT "AccessToken_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "EventGuest" DROP CONSTRAINT "EventGuest_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventGuest" DROP CONSTRAINT "EventGuest_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventLike" DROP CONSTRAINT "EventLike_authorId_fkey";

-- DropForeignKey
ALTER TABLE "EventLike" DROP CONSTRAINT "EventLike_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Forum" DROP CONSTRAINT "Forum_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_postId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_forumId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_postId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_senderId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "_EventHashtags" DROP CONSTRAINT "_EventHashtags_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventHashtags" DROP CONSTRAINT "_EventHashtags_B_fkey";

-- DropTable
DROP TABLE "AccessToken";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "EventGuest";

-- DropTable
DROP TABLE "EventLike";

-- DropTable
DROP TABLE "Forum";

-- DropTable
DROP TABLE "Hashtag";

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "Invitation";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "PostLike";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "UserCredentials";

-- DropTable
DROP TABLE "UserProfile";

-- DropTable
DROP TABLE "_EventHashtags";
