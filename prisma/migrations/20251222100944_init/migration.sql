-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'PENDING');

-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('MONTHLY', 'DAILY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('GCASH', 'BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'FREE_MEMBERSHIP', 'DISCOUNT_COUPON', 'OTHER');

-- CreateEnum
CREATE TYPE "ReferralSource" AS ENUM ('WORD_OF_MOUTH', 'SOCIAL_MEDIA', 'ADS', 'GOOGLE_MAPS', 'WEBSITE_BLOGS', 'INFLUENCER_CREATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "PerkType" AS ENUM ('MEETING_ROOM_HOURS', 'PRINTING_CREDITS', 'EVENT_DISCOUNT', 'LOCKER_ACCESS', 'COFFEE_VOUCHERS', 'PARKING_SLOTS', 'GUEST_PASSES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MeetingRoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'PASSWORD_RESET', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'EMAIL_CHANGE', 'MEMBERSHIP_PURCHASE', 'MEMBERSHIP_RENEWAL', 'MEMBERSHIP_CANCELLATION', 'MEMBERSHIP_EXPIRY', 'EVENT_REGISTRATION', 'EVENT_CANCELLATION', 'EVENT_ATTENDANCE', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_VERIFIED', 'ROOM_BOOKING_CREATED', 'ROOM_BOOKING_CONFIRMED', 'ROOM_BOOKING_CANCELLED', 'ROOM_BOOKING_CHECKIN', 'ROOM_BOOKING_CHECKOUT', 'PERK_USED', 'PERK_EXPIRED', 'DAILY_USE_REDEEMED', 'ADMIN_USER_CREATED', 'ADMIN_USER_UPDATED', 'ADMIN_USER_DELETED', 'ADMIN_USER_ROLE_CHANGED', 'ADMIN_USER_SUSPENDED', 'ADMIN_USER_ACTIVATED', 'ADMIN_EVENT_CREATED', 'ADMIN_EVENT_UPDATED', 'ADMIN_EVENT_DELETED', 'ADMIN_EVENT_PUBLISHED', 'ADMIN_EVENT_UNPUBLISHED', 'ADMIN_MEMBERSHIP_CREATED', 'ADMIN_MEMBERSHIP_UPDATED', 'ADMIN_MEMBERSHIP_CANCELLED', 'ADMIN_PLAN_CREATED', 'ADMIN_PLAN_UPDATED', 'ADMIN_PLAN_DELETED', 'ADMIN_PAYMENT_VERIFIED', 'ADMIN_PAYMENT_REJECTED', 'ADMIN_PAYMENT_REFUNDED', 'ADMIN_ROOM_CREATED', 'ADMIN_ROOM_UPDATED', 'ADMIN_ROOM_DELETED', 'ADMIN_BOOKING_CREATED', 'ADMIN_BOOKING_CANCELLED', 'ADMIN_SETTINGS_UPDATED', 'ADMIN_COUPON_CREATED', 'ADMIN_COUPON_UPDATED', 'ADMIN_COUPON_DELETED', 'ADMIN_CATEGORY_CREATED', 'ADMIN_CATEGORY_UPDATED', 'ADMIN_CATEGORY_DELETED', 'SYSTEM_NOTIFICATION_SENT', 'SYSTEM_EMAIL_SENT', 'SYSTEM_ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isMember" BOOLEAN NOT NULL DEFAULT false,
    "company" TEXT,
    "contactNumber" TEXT,
    "birthdate" TIMESTAMP(3),
    "referralSource" "ReferralSource",
    "agreeToNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contactNumber" TEXT,
    "company" TEXT,
    "userId" TEXT,
    "notes" TEXT,
    "referralSource" "ReferralSource",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

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
    "daysOfWeek" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TEXT,
    "validUntil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plan_perks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "type" "MembershipType" NOT NULL DEFAULT 'MONTHLY',
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "billingAddress" TEXT,
    "paymentId" TEXT,
    "couponId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_perk_usages" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "userId" TEXT,
    "perkId" TEXT,
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
CREATE TABLE "event_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isMemberOnly" BOOLEAN NOT NULL DEFAULT false,
    "memberDiscount" DOUBLE PRECISION DEFAULT 0,
    "memberDiscountType" TEXT DEFAULT 'FIXED',
    "memberDiscountedPrice" DOUBLE PRECISION,
    "hasCustomerFreebies" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "isRedemptionEvent" BOOLEAN NOT NULL DEFAULT false,
    "redemptionLimit" INTEGER,
    "maxAttendees" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_freebies" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_freebies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendeeName" TEXT,
    "attendeeEmail" TEXT,
    "numberOfPax" INTEGER NOT NULL DEFAULT 1,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_event_registrations" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "attendeeEmail" TEXT,
    "attendeePhone" TEXT,
    "numberOfPax" INTEGER NOT NULL DEFAULT 1,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_event_registrations_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "customer_event_pax" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_event_pax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pax_freebies" (
    "id" TEXT NOT NULL,
    "paxId" TEXT NOT NULL,
    "freebieId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "option" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pax_freebies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_pax_freebies" (
    "id" TEXT NOT NULL,
    "paxId" TEXT NOT NULL,
    "freebieId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "option" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_pax_freebies_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "customer_daily_use_redemptions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "customer_daily_use_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "referenceNumber" TEXT,
    "proofImageUrl" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_payments" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "referenceNumber" TEXT,
    "proofImageUrl" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "qrCodeUrl" TEXT,
    "qrCodeNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverPhotoUrl" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "amenities" TEXT,
    "status" "MeetingRoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "floor" TEXT,
    "roomNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_room_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "company" TEXT,
    "contactName" TEXT NOT NULL,
    "designation" TEXT,
    "contactEmail" TEXT,
    "contactMobile" TEXT,
    "numberOfAttendees" INTEGER NOT NULL DEFAULT 1,
    "purpose" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT,
    "isUsingMembershipPerk" BOOLEAN NOT NULL DEFAULT false,
    "membershipPerkUsageId" TEXT,
    "notes" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_room_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_meeting_room_bookings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "company" TEXT,
    "contactPerson" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "designation" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactMobile" TEXT,
    "numberOfAttendees" INTEGER NOT NULL DEFAULT 1,
    "purpose" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT,
    "notes" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_meeting_room_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_isMember_idx" ON "users"("isMember");

-- CreateIndex
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_contactNumber_idx" ON "customers"("contactNumber");

-- CreateIndex
CREATE INDEX "customers_userId_idx" ON "customers"("userId");

-- CreateIndex
CREATE INDEX "membership_plans_type_idx" ON "membership_plans"("type");

-- CreateIndex
CREATE INDEX "membership_plans_isActive_idx" ON "membership_plans"("isActive");

-- CreateIndex
CREATE INDEX "membership_plan_perks_planId_idx" ON "membership_plan_perks"("planId");

-- CreateIndex
CREATE INDEX "membership_plan_perks_perkType_idx" ON "membership_plan_perks"("perkType");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_paymentId_key" ON "memberships"("paymentId");

-- CreateIndex
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");

-- CreateIndex
CREATE INDEX "memberships_planId_idx" ON "memberships"("planId");

-- CreateIndex
CREATE INDEX "memberships_status_idx" ON "memberships"("status");

-- CreateIndex
CREATE INDEX "memberships_type_idx" ON "memberships"("type");

-- CreateIndex
CREATE INDEX "membership_perk_usages_membershipId_idx" ON "membership_perk_usages"("membershipId");

-- CreateIndex
CREATE INDEX "membership_perk_usages_perkId_idx" ON "membership_perk_usages"("perkId");

-- CreateIndex
CREATE INDEX "membership_perk_usages_perkType_idx" ON "membership_perk_usages"("perkType");

-- CreateIndex
CREATE INDEX "membership_perk_usages_usedAt_idx" ON "membership_perk_usages"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_isActive_idx" ON "coupons"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "event_categories_name_key" ON "event_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_categories_slug_key" ON "event_categories"("slug");

-- CreateIndex
CREATE INDEX "event_categories_slug_idx" ON "event_categories"("slug");

-- CreateIndex
CREATE INDEX "event_categories_isActive_idx" ON "event_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_isFree_idx" ON "events"("isFree");

-- CreateIndex
CREATE INDEX "events_isMemberOnly_idx" ON "events"("isMemberOnly");

-- CreateIndex
CREATE INDEX "events_isRedemptionEvent_idx" ON "events"("isRedemptionEvent");

-- CreateIndex
CREATE INDEX "events_categoryId_idx" ON "events"("categoryId");

-- CreateIndex
CREATE INDEX "events_slug_idx" ON "events"("slug");

-- CreateIndex
CREATE INDEX "event_freebies_eventId_idx" ON "event_freebies"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_paymentId_key" ON "event_registrations"("paymentId");

-- CreateIndex
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations"("userId");

-- CreateIndex
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_userId_eventId_key" ON "event_registrations"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_event_registrations_paymentId_key" ON "customer_event_registrations"("paymentId");

-- CreateIndex
CREATE INDEX "customer_event_registrations_customerId_idx" ON "customer_event_registrations"("customerId");

-- CreateIndex
CREATE INDEX "customer_event_registrations_eventId_idx" ON "customer_event_registrations"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_event_registrations_customerId_eventId_key" ON "customer_event_registrations"("customerId", "eventId");

-- CreateIndex
CREATE INDEX "event_pax_registrationId_idx" ON "event_pax"("registrationId");

-- CreateIndex
CREATE INDEX "customer_event_pax_registrationId_idx" ON "customer_event_pax"("registrationId");

-- CreateIndex
CREATE INDEX "pax_freebies_paxId_idx" ON "pax_freebies"("paxId");

-- CreateIndex
CREATE INDEX "pax_freebies_freebieId_idx" ON "pax_freebies"("freebieId");

-- CreateIndex
CREATE UNIQUE INDEX "pax_freebies_paxId_freebieId_key" ON "pax_freebies"("paxId", "freebieId");

-- CreateIndex
CREATE INDEX "customer_pax_freebies_paxId_idx" ON "customer_pax_freebies"("paxId");

-- CreateIndex
CREATE INDEX "customer_pax_freebies_freebieId_idx" ON "customer_pax_freebies"("freebieId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_pax_freebies_paxId_freebieId_key" ON "customer_pax_freebies"("paxId", "freebieId");

-- CreateIndex
CREATE INDEX "daily_use_redemptions_userId_idx" ON "daily_use_redemptions"("userId");

-- CreateIndex
CREATE INDEX "daily_use_redemptions_eventId_idx" ON "daily_use_redemptions"("eventId");

-- CreateIndex
CREATE INDEX "daily_use_redemptions_redeemedAt_idx" ON "daily_use_redemptions"("redeemedAt");

-- CreateIndex
CREATE INDEX "customer_daily_use_redemptions_customerId_idx" ON "customer_daily_use_redemptions"("customerId");

-- CreateIndex
CREATE INDEX "customer_daily_use_redemptions_eventId_idx" ON "customer_daily_use_redemptions"("eventId");

-- CreateIndex
CREATE INDEX "customer_daily_use_redemptions_redeemedAt_idx" ON "customer_daily_use_redemptions"("redeemedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentReference_key" ON "payments"("paymentReference");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paymentReference_idx" ON "payments"("paymentReference");

-- CreateIndex
CREATE INDEX "payments_referenceNumber_idx" ON "payments"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customer_payments_paymentReference_key" ON "customer_payments"("paymentReference");

-- CreateIndex
CREATE INDEX "customer_payments_customerId_idx" ON "customer_payments"("customerId");

-- CreateIndex
CREATE INDEX "customer_payments_status_idx" ON "customer_payments"("status");

-- CreateIndex
CREATE INDEX "customer_payments_paymentReference_idx" ON "customer_payments"("paymentReference");

-- CreateIndex
CREATE INDEX "customer_payments_referenceNumber_idx" ON "customer_payments"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_rooms_name_key" ON "meeting_rooms"("name");

-- CreateIndex
CREATE INDEX "meeting_rooms_name_idx" ON "meeting_rooms"("name");

-- CreateIndex
CREATE INDEX "meeting_rooms_status_idx" ON "meeting_rooms"("status");

-- CreateIndex
CREATE INDEX "meeting_rooms_isActive_idx" ON "meeting_rooms"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_room_bookings_paymentId_key" ON "meeting_room_bookings"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_room_bookings_membershipPerkUsageId_key" ON "meeting_room_bookings"("membershipPerkUsageId");

-- CreateIndex
CREATE INDEX "meeting_room_bookings_userId_idx" ON "meeting_room_bookings"("userId");

-- CreateIndex
CREATE INDEX "meeting_room_bookings_roomId_idx" ON "meeting_room_bookings"("roomId");

-- CreateIndex
CREATE INDEX "meeting_room_bookings_bookingDate_idx" ON "meeting_room_bookings"("bookingDate");

-- CreateIndex
CREATE INDEX "meeting_room_bookings_status_idx" ON "meeting_room_bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customer_meeting_room_bookings_paymentId_key" ON "customer_meeting_room_bookings"("paymentId");

-- CreateIndex
CREATE INDEX "customer_meeting_room_bookings_customerId_idx" ON "customer_meeting_room_bookings"("customerId");

-- CreateIndex
CREATE INDEX "customer_meeting_room_bookings_roomId_idx" ON "customer_meeting_room_bookings"("roomId");

-- CreateIndex
CREATE INDEX "customer_meeting_room_bookings_bookingDate_idx" ON "customer_meeting_room_bookings"("bookingDate");

-- CreateIndex
CREATE INDEX "customer_meeting_room_bookings_status_idx" ON "customer_meeting_room_bookings"("status");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

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
ALTER TABLE "membership_plan_perks" ADD CONSTRAINT "membership_plan_perks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_perk_usages" ADD CONSTRAINT "membership_perk_usages_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_perk_usages" ADD CONSTRAINT "membership_perk_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_perk_usages" ADD CONSTRAINT "membership_perk_usages_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "membership_plan_perks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_freebies" ADD CONSTRAINT "event_freebies_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_registrations" ADD CONSTRAINT "customer_event_registrations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_registrations" ADD CONSTRAINT "customer_event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_registrations" ADD CONSTRAINT "customer_event_registrations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "customer_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_pax" ADD CONSTRAINT "event_pax_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_pax" ADD CONSTRAINT "customer_event_pax_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "customer_event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pax_freebies" ADD CONSTRAINT "pax_freebies_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "event_pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pax_freebies" ADD CONSTRAINT "pax_freebies_freebieId_fkey" FOREIGN KEY ("freebieId") REFERENCES "event_freebies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pax_freebies" ADD CONSTRAINT "customer_pax_freebies_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "customer_event_pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pax_freebies" ADD CONSTRAINT "customer_pax_freebies_freebieId_fkey" FOREIGN KEY ("freebieId") REFERENCES "event_freebies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_use_redemptions" ADD CONSTRAINT "daily_use_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_daily_use_redemptions" ADD CONSTRAINT "customer_daily_use_redemptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_room_bookings" ADD CONSTRAINT "meeting_room_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_room_bookings" ADD CONSTRAINT "meeting_room_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "meeting_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_room_bookings" ADD CONSTRAINT "meeting_room_bookings_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_room_bookings" ADD CONSTRAINT "meeting_room_bookings_membershipPerkUsageId_fkey" FOREIGN KEY ("membershipPerkUsageId") REFERENCES "membership_perk_usages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_meeting_room_bookings" ADD CONSTRAINT "customer_meeting_room_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_meeting_room_bookings" ADD CONSTRAINT "customer_meeting_room_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "meeting_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_meeting_room_bookings" ADD CONSTRAINT "customer_meeting_room_bookings_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "customer_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
