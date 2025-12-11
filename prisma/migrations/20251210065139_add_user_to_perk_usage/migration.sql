-- DropIndex
DROP INDEX "membership_perk_usages_userId_idx";

-- AlterTable
ALTER TABLE "membership_perk_usages" ADD COLUMN     "perkId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "membership_perk_usages_perkId_idx" ON "membership_perk_usages"("perkId");

-- AddForeignKey
ALTER TABLE "membership_perk_usages" ADD CONSTRAINT "membership_perk_usages_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "membership_plan_perks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
