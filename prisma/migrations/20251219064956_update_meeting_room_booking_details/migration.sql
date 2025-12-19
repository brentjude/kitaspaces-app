/*
  Warnings:

  - Added the required column `contactName` to the `customer_meeting_room_bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `purpose` on table `customer_meeting_room_bookings` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `contactName` to the `meeting_room_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customer_meeting_room_bookings" ADD COLUMN     "company" TEXT,
ADD COLUMN     "contactMobile" TEXT,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT,
ALTER COLUMN "purpose" SET NOT NULL;

-- AlterTable
ALTER TABLE "meeting_room_bookings" ADD COLUMN     "company" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactMobile" TEXT,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT;
