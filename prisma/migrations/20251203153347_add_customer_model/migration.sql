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
CREATE TABLE "customer_pax_freebies" (
    "id" TEXT NOT NULL,
    "paxId" TEXT NOT NULL,
    "freebieId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_pax_freebies_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "customer_payments" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "proofImageUrl" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_contactNumber_idx" ON "customers"("contactNumber");

-- CreateIndex
CREATE INDEX "customers_userId_idx" ON "customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_event_registrations_paymentId_key" ON "customer_event_registrations"("paymentId");

-- CreateIndex
CREATE INDEX "customer_event_registrations_customerId_idx" ON "customer_event_registrations"("customerId");

-- CreateIndex
CREATE INDEX "customer_event_registrations_eventId_idx" ON "customer_event_registrations"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_event_registrations_customerId_eventId_key" ON "customer_event_registrations"("customerId", "eventId");

-- CreateIndex
CREATE INDEX "customer_event_pax_registrationId_idx" ON "customer_event_pax"("registrationId");

-- CreateIndex
CREATE INDEX "customer_pax_freebies_paxId_idx" ON "customer_pax_freebies"("paxId");

-- CreateIndex
CREATE INDEX "customer_pax_freebies_freebieId_idx" ON "customer_pax_freebies"("freebieId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_pax_freebies_paxId_freebieId_key" ON "customer_pax_freebies"("paxId", "freebieId");

-- CreateIndex
CREATE INDEX "customer_daily_use_redemptions_customerId_idx" ON "customer_daily_use_redemptions"("customerId");

-- CreateIndex
CREATE INDEX "customer_daily_use_redemptions_eventId_idx" ON "customer_daily_use_redemptions"("eventId");

-- CreateIndex
CREATE INDEX "customer_daily_use_redemptions_redeemedAt_idx" ON "customer_daily_use_redemptions"("redeemedAt");

-- CreateIndex
CREATE INDEX "customer_payments_customerId_idx" ON "customer_payments"("customerId");

-- CreateIndex
CREATE INDEX "customer_payments_status_idx" ON "customer_payments"("status");

-- CreateIndex
CREATE INDEX "customer_payments_referenceNumber_idx" ON "customer_payments"("referenceNumber");

-- AddForeignKey
ALTER TABLE "customer_event_registrations" ADD CONSTRAINT "customer_event_registrations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_registrations" ADD CONSTRAINT "customer_event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_registrations" ADD CONSTRAINT "customer_event_registrations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "customer_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_event_pax" ADD CONSTRAINT "customer_event_pax_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "customer_event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pax_freebies" ADD CONSTRAINT "customer_pax_freebies_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "customer_event_pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pax_freebies" ADD CONSTRAINT "customer_pax_freebies_freebieId_fkey" FOREIGN KEY ("freebieId") REFERENCES "event_freebies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_daily_use_redemptions" ADD CONSTRAINT "customer_daily_use_redemptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
