/*
  Warnings:

  - A unique constraint covering the columns `[paymentReference]` on the table `customer_payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentReference]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "customer_payments" ADD COLUMN     "paymentReference" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customer_payments_paymentReference_key" ON "customer_payments"("paymentReference");

-- CreateIndex
CREATE INDEX "customer_payments_paymentReference_idx" ON "customer_payments"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentReference_key" ON "payments"("paymentReference");

-- CreateIndex
CREATE INDEX "payments_paymentReference_idx" ON "payments"("paymentReference");
