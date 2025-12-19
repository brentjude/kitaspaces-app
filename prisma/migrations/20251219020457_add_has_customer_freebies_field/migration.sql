-- AlterTable
ALTER TABLE "events" ADD COLUMN     "hasCustomerFreebies" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "memberDiscount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "memberDiscountType" TEXT DEFAULT 'FIXED',
ADD COLUMN     "memberDiscountedPrice" DOUBLE PRECISION;
