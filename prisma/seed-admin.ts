// Minimal seed file that only creates the admin user
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
  console.log("🌱 Start admin-only seeding...");

  await prisma.$connect();
  console.log("✅ Database connection successful");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "kitaadmin@gmail.com" },
  });

  if (existingAdmin) {
    console.log("⚠️  Admin user already exists!");
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   Name: ${existingAdmin.name}`);
    return;
  }

  // Create Admin User
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

  console.log("\n🎉 Admin user created successfully!");
  console.log("\n📊 Admin Details:");
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: KITA@boombox2025!`);
  console.log(`   ID: ${adminUser.id}`);
  console.log(`   Name: ${adminUser.name}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log("\n✅ You can now login to the admin panel!");
}

main()
  .catch((e) => {
    console.error("\n💥 Admin seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });