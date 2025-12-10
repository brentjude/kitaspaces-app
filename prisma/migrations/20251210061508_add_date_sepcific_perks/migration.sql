/*
  Warnings:

  - You are about to drop the column `maxPerDay` on the `membership_plan_perks` table. All the data in the column will be lost.
  - You are about to drop the column `maxPerWeek` on the `membership_plan_perks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "membership_plan_perks" DROP COLUMN "maxPerDay",
DROP COLUMN "maxPerWeek",
ADD COLUMN     "daysOfWeek" TEXT,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validFrom" TEXT,
ADD COLUMN     "validUntil" TEXT;
