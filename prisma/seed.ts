import { PrismaClient, Prisma } from "../src/generated/prisma";
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

console.log('🔧 Initializing Prisma adapter...');
console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
console.log('📍 Full URL:', process.env.DATABASE_URL);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

console.log('✅ Adapter created');

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

console.log('✅ Prisma client initialized');

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Kita Admin",
    email: "kitaadmin@gmail.com",
    password: "", // Will be hashed below
    role: "ADMIN",
  },
];

async function main() {
  console.log('🌱 Start seeding...');
  console.log('📦 User data to seed:', userData.length, 'user(s)');

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  // Hash the admin password
  console.log('🔐 Hashing password...');
  const hashedPassword = await hash('KITA@boombox2025!', 10);
  userData[0].password = hashedPassword;
  console.log('✅ Password hashed successfully');

  for (const u of userData) {
    console.log(`\n👤 Processing user: ${u.email}`);
    
    try {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
      console.log(`✅ Created/Updated user: ${user.email} (${user.role})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Created at: ${user.createdAt}`);
    } catch (error) {
      console.error(`❌ Error processing user ${u.email}:`, error);
      throw error;
    }
  }

  console.log('\n🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('\n💥 Seeding failed with error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Disconnected');
  });