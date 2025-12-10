/*
  Warnings:

  - You are about to drop the `freebie_selections` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('MONTHLY', 'DAILY');

-- CreateEnum
CREATE TYPE "ReferralSource" AS ENUM ('WORD_OF_MOUTH', 'SOCIAL_MEDIA', 'ADS', 'GOOGLE_MAPS', 'WEBSITE_BLOGS', 'INFLUENCER_CREATOR', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'FREE_MEMBERSHIP';
ALTER TYPE "PaymentMethod" ADD VALUE 'DISCOUNT_COUPON';

-- DropForeignKey
ALTER TABLE "freebie_selections" DROP CONSTRAINT "freebie_selections_freebieId_fkey";

-- DropForeignKey
ALTER TABLE "freebie_selections" DROP CONSTRAINT "freebie_selections_registrationId_fkey";

-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "numberOfPax" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isFreeForMembers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRedemptionEvent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redemptionLimit" INTEGER;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "type" "MembershipType" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "agreeToNewsletter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthdate" TIMESTAMP(3),
ADD COLUMN     "company" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "referralSource" "ReferralSource";

-- DropTable
DROP TABLE "freebie_selections";

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_pax" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pax_freebies" (
    "id" TEXT NOT NULL,
    "paxId" TEXT NOT NULL,
    "freebieId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pax_freebies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_use_redemptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "daily_use_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_isActive_idx" ON "coupons"("isActive");

-- CreateIndex
CREATE INDEX "event_pax_registrationId_idx" ON "event_pax"("registrationId");

-- CreateIndex
CREATE INDEX "pax_freebies_paxId_idx" ON "pax_freebies"("paxId");

-- CreateIndex
CREATE INDEX "pax_freebies_freebieId_idx" ON "pax_freebies"("freebieId");

-- CreateIndex
CREATE UNIQUE INDEX "pax_freebies_paxId_freebieId_key" ON "pax_freebies"("paxId", "freebieId");

-- CreateIndex
CREATE INDEX "daily_use_redemptions_userId_idx" ON "daily_use_redemptions"("userId");

-- CreateIndex
CREATE INDEX "daily_use_redemptions_eventId_idx" ON "daily_use_redemptions"("eventId");

-- CreateIndex
CREATE INDEX "daily_use_redemptions_redeemedAt_idx" ON "daily_use_redemptions"("redeemedAt");

-- CreateIndex
CREATE INDEX "events_isRedemptionEvent_idx" ON "events"("isRedemptionEvent");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_paymentId_key" ON "memberships"("paymentId");

-- CreateIndex
CREATE INDEX "memberships_type_idx" ON "memberships"("type");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_pax" ADD CONSTRAINT "event_pax_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pax_freebies" ADD CONSTRAINT "pax_freebies_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "event_pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pax_freebies" ADD CONSTRAINT "pax_freebies_freebieId_fkey" FOREIGN KEY ("freebieId") REFERENCES "event_freebies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_use_redemptions" ADD CONSTRAINT "daily_use_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
