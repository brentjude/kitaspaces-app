// Seed reset file - Erases all data and creates only admin user + essential settings
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

console.log("🔧 Initializing Prisma adapter...");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

console.log("✅ Prisma client initialized");

// Helper function to generate user ID
async function generateUserId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString();

  const latestUser = await prisma.user.findFirst({
    where: {
      id: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  let nextNumber = 1;

  if (latestUser) {
    const lastNumber = parseInt(latestUser.id.slice(-3));
    nextNumber = lastNumber + 1;
  }

  return `${yearPrefix}${nextNumber.toString().padStart(3, "0")}`;
}

async function main() {
  console.log("🌱 Start database reset and admin seeding...");

  await prisma.$connect();
  console.log("✅ Database connection successful");

  // ============================================
  // STEP 1: ERASE ALL DATA
  // ============================================
  console.log("\n🗑️  ERASING ALL DATA...");
  
  try {
    // Delete in correct order to respect foreign key constraints
    console.log("   Deleting password reset tokens...");
    await prisma.passwordResetToken.deleteMany();
    
    console.log("   Deleting activity logs...");
    await prisma.activityLog.deleteMany();
    
    console.log("   Deleting meeting room bookings...");
    await prisma.customerMeetingRoomBooking.deleteMany();
    await prisma.meetingRoomBooking.deleteMany();
    
    console.log("   Deleting meeting rooms...");
    await prisma.meetingRoom.deleteMany();
    
    console.log("   Deleting membership perk usages...");
    await prisma.membershipPerkUsage.deleteMany();
    
    console.log("   Deleting daily use redemptions...");
    await prisma.customerDailyUseRedemption.deleteMany();
    await prisma.dailyUseRedemption.deleteMany();
    
    console.log("   Deleting event pax and freebies...");
    await prisma.customerPaxFreebie.deleteMany();
    await prisma.paxFreebie.deleteMany();
    await prisma.customerEventPax.deleteMany();
    await prisma.eventPax.deleteMany();
    
    console.log("   Deleting event registrations...");
    await prisma.customerEventRegistration.deleteMany();
    await prisma.eventRegistration.deleteMany();
    
    console.log("   Deleting events and freebies...");
    await prisma.eventFreebie.deleteMany();
    await prisma.event.deleteMany();
    
    console.log("   Deleting event categories...");
    await prisma.eventCategory.deleteMany();
    
    console.log("   Deleting memberships...");
    await prisma.membership.deleteMany();
    
    console.log("   Deleting membership plans and perks...");
    await prisma.membershipPlanPerk.deleteMany();
    await prisma.membershipPlan.deleteMany();
    
    console.log("   Deleting coupons...");
    await prisma.coupon.deleteMany();
    
    console.log("   Deleting payments...");
    await prisma.customerPayment.deleteMany();
    await prisma.payment.deleteMany();
    
    console.log("   Deleting customers...");
    await prisma.customer.deleteMany();
    
    console.log("   Deleting admin settings...");
    await prisma.adminSettings.deleteMany();
    
    console.log("   Deleting users...");
    await prisma.user.deleteMany();
    
    console.log("✅ All data erased successfully");
  } catch (error) {
    console.error("❌ Error during data deletion:", error);
    throw error;
  }

  // ============================================
  // STEP 2: CREATE ADMIN SETTINGS
  // ============================================
  console.log("\n⚙️  Creating admin settings...");
  
  const adminSettings = await prisma.adminSettings.create({
    data: {
      bankName: "BDO",
      accountNumber: "1234567890",
      accountName: "KITA Spaces Inc.",
      qrCodeUrl: null,
      qrCodeNumber: "+639123456789",
    },
  });
  
  console.log("✅ Admin settings created");

  // ============================================
  // STEP 3: CREATE ADMIN USER
  // ============================================
  console.log("\n👤 Creating admin user...");
  
  const hashedAdminPassword = await hash("KITA@boombox2025!", 10);
  const adminUserId = await generateUserId();
  
  const adminUser = await prisma.user.create({
    data: {
      id: adminUserId,
      email: "kitaadmin@gmail.com",
      password: hashedAdminPassword,
      name: "Kita Admin",
      nickname: "Admin",
      role: "ADMIN",
      isMember: true,
      contactNumber: "+639123456789",
      referralSource: "OTHER",
      agreeToNewsletter: true,
    },
  });

  console.log("✅ Admin user created");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DATABASE RESET COMPLETE!");
  console.log("=".repeat(60));
  
  console.log("\n📊 Created Resources:");
  console.log(`   ✅ Admin Settings (ID: ${adminSettings.id})`);
  console.log(`   ✅ Admin User (ID: ${adminUser.id})`);
  
  console.log("\n🔑 Admin Login Credentials:");
  console.log(`   Email:    ${adminUser.email}`);
  console.log(`   Password: KITA@boombox2025!`);
  console.log(`   Name:     ${adminUser.name}`);
  console.log(`   Role:     ${adminUser.role}`);
  
  console.log("\n💳 Payment Settings:");
  console.log(`   Bank:     ${adminSettings.bankName}`);
  console.log(`   Account:  ${adminSettings.accountNumber}`);
  console.log(`   Name:     ${adminSettings.accountName}`);
  console.log(`   QR Phone: ${adminSettings.qrCodeNumber}`);
  
  console.log("\n📈 Database Statistics:");
  console.log(`   Users:              ${await prisma.user.count()}`);
  console.log(`   Customers:          ${await prisma.customer.count()}`);
  console.log(`   Events:             ${await prisma.event.count()}`);
  console.log(`   Memberships:        ${await prisma.membership.count()}`);
  console.log(`   Meeting Rooms:      ${await prisma.meetingRoom.count()}`);
  console.log(`   Payments:           ${await prisma.payment.count()}`);
  console.log(`   Customer Payments:  ${await prisma.customerPayment.count()}`);
  
  console.log("\n✅ Ready to use! You can now:");
  console.log("   1. Login to admin panel at /admin");
  console.log("   2. Create membership plans");
  console.log("   3. Create event categories");
  console.log("   4. Create meeting rooms");
  console.log("   5. Create events");
  console.log("   6. Add customers/members");
  
  console.log("\n" + "=".repeat(60));
}

main()
  .catch((e) => {
    console.error("\n💥 Database reset failed:", e);
    console.error("\nError details:", e.message);
    if (e.code) {
      console.error(`Error code: ${e.code}`);
    }
    process.exit(1);
  })
  .finally(async () => {
    console.log("\n🔌 Disconnecting from database...");
    await prisma.$disconnect();
    console.log("✅ Disconnected");
  });