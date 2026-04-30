-- AlterTable
ALTER TABLE "customer_event_registrations" ADD COLUMN     "referralCode" TEXT;

-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "referralCode" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "hasReferral" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "event_referrals" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_referrals_code_key" ON "event_referrals"("code");

-- CreateIndex
CREATE INDEX "event_referrals_eventId_idx" ON "event_referrals"("eventId");

-- CreateIndex
CREATE INDEX "event_referrals_code_idx" ON "event_referrals"("code");

-- AddForeignKey
ALTER TABLE "event_referrals" ADD CONSTRAINT "event_referrals_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
