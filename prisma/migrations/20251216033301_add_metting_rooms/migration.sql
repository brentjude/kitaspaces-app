-- CreateEnum
CREATE TYPE "MeetingRoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

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
    "numberOfAttendees" INTEGER NOT NULL DEFAULT 1,
    "purpose" TEXT,
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
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
