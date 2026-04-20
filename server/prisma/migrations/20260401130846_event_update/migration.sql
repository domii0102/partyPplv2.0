-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDateTime" TIMESTAMP(3),
ADD COLUMN     "guestLimit" INTEGER,
ADD COLUMN     "locationAddress" VARCHAR(128),
ADD COLUMN     "locationName" VARCHAR(64);
