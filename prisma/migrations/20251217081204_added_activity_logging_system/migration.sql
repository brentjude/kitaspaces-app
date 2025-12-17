-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'PASSWORD_RESET', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'EMAIL_CHANGE', 'MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_CANCELLATION', 'MEMBERSHIP_EXPIRY', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'EVENT_ATTENDANCE', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_VERIFIED', 'ROOM_BOOKING_CREATED', 'ROOM_BOOKING_CONFIRMED', 'ROOM_BOOKING_CANCELLED', 'ROOM_BOOKING_CHECKIN', 'ROOM_BOOKING_CHECKOUT', 'PERK_USED', 'PERK_EXPIRED', 'DAILY_USE_REDEEMED', 'ADMIN_USER_CREATED', 'ADMIN_USER_UPDATED', 'ADMIN_USER_DELETED', 'ADMIN_USER_ROLE_CHANGED', 'ADMIN_USER_SUSPENDED', 'ADMIN_USER_ACTIVATED', 'ADMIN_EVENT_CREATED', 'ADMIN_EVENT_UPDATED', 'ADMIN_EVENT_DELETED', 'ADMIN_EVENT_PUBLISHED', 'ADMIN_EVENT_UNPUBLISHED', 'ADMIN_MEMBERSHIP_CREATED', 'ADMIN_MEMBERSHIP_UPDATED', 'ADMIN_MEMBERSHIP_CANCELLED', 'ADMIN_PLAN_CREATED', 'ADMIN_PLAN_UPDATED', 'ADMIN_PLAN_DELETED', 'ADMIN_PAYMENT_VERIFIED', 'ADMIN_PAYMENT_REJECTED', 'ADMIN_PAYMENT_REFUNDED', 'ADMIN_ROOM_CREATED', 'ADMIN_ROOM_UPDATED', 'ADMIN_ROOM_DELETED', 'ADMIN_BOOKING_CREATED', 'ADMIN_BOOKING_CANCELLED', 'ADMIN_SETTINGS_UPDATED', 'ADMIN_COUPON_CREATED', 'ADMIN_COUPON_UPDATED', 'ADMIN_COUPON_DELETED', 'ADMIN_CATEGORY_CREATED', 'ADMIN_CATEGORY_UPDATED', 'ADMIN_CATEGORY_DELETED', 'SYSTEM_NOTIFICATION_SENT', 'SYSTEM_EMAIL_SENT', 'SYSTEM_ERROR');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "adminId" TEXT,
    "customerId" TEXT,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_adminId_idx" ON "activity_logs"("adminId");

-- CreateIndex
CREATE INDEX "activity_logs_customerId_idx" ON "activity_logs"("customerId");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_referenceId_idx" ON "activity_logs"("referenceId");

-- CreateIndex
CREATE INDEX "activity_logs_referenceType_idx" ON "activity_logs"("referenceType");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_isSuccess_idx" ON "activity_logs"("isSuccess");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
