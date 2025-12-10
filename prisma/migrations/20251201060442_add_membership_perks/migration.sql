-- CreateEnum
CREATE TYPE "PerkType" AS ENUM ('MEETING_ROOM_HOURS', 'PRINTING_CREDITS', 'EVENT_DISCOUNT', 'LOCKER_ACCESS', 'COFFEE_VOUCHERS', 'PARKING_SLOTS', 'GUEST_PASSES', 'CUSTOM');

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "planId" TEXT;

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "MembershipType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_plan_perks" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "perkType" "PerkType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "maxPerDay" DOUBLE PRECISION,
    "maxPerWeek" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plan_perks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_perk_usages" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "perkType" "PerkType" NOT NULL,
    "perkName" TEXT NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "referenceId" TEXT,
    "referenceType" TEXT,

    CONSTRAINT "membership_perk_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "membership_plans_type_idx" ON "membership_plans"("type");

-- CreateIndex
CREATE INDEX "membership_plans_isActive_idx" ON "membership_plans"("isActive");

-- CreateIndex
CREATE INDEX "membership_plan_perks_planId_idx" ON "membership_plan_perks"("planId");

-- CreateIndex
CREATE INDEX "membership_plan_perks_perkType_idx" ON "membership_plan_perks"("perkType");

-- CreateIndex
CREATE INDEX "membership_perk_usages_membershipId_idx" ON "membership_perk_usages"("membershipId");

-- CreateIndex
CREATE INDEX "membership_perk_usages_userId_idx" ON "membership_perk_usages"("userId");

-- CreateIndex
CREATE INDEX "membership_perk_usages_perkType_idx" ON "membership_perk_usages"("perkType");

-- CreateIndex
CREATE INDEX "membership_perk_usages_usedAt_idx" ON "membership_perk_usages"("usedAt");

-- CreateIndex
CREATE INDEX "memberships_planId_idx" ON "memberships"("planId");

-- AddForeignKey
ALTER TABLE "membership_plan_perks" ADD CONSTRAINT "membership_plan_perks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_perk_usages" ADD CONSTRAINT "membership_perk_usages_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_perk_usages" ADD CONSTRAINT "membership_perk_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
