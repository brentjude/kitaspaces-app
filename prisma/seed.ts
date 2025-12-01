import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

console.log('🔧 Initializing Prisma adapter...');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

console.log('✅ Prisma client initialized');

async function main() {
  console.log('🌱 Start seeding...');

  await prisma.$connect();
  console.log('✅ Database connection successful');

  // Clear existing data
  console.log('\n🗑️  Clearing existing data...');
  await prisma.dailyUseRedemption.deleteMany();
  await prisma.paxFreebie.deleteMany();
  await prisma.eventPax.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.eventFreebie.deleteMany();
  await prisma.event.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared all data');

  // Create Coupons
  console.log('\n🎟️  Creating coupons...');
  const freeCoupon = await prisma.coupon.create({
    data: {
      code: 'WELCOME2025',
      description: 'Free first month membership',
      discountType: 'FREE',
      discountValue: 100,
      maxUses: 50,
      isActive: true,
      expiresAt: new Date('2025-12-31'),
    },
  });
  
  const discount50 = await prisma.coupon.create({
    data: {
      code: 'SAVE50',
      description: '50% off monthly membership',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maxUses: 100,
      isActive: true,
      expiresAt: new Date('2025-06-30'),
    },
  });
  console.log(`✅ Created 2 coupons`);

  // Create Admin User
  console.log('\n👤 Creating admin user...');
  const hashedAdminPassword = await hash('KITA@boombox2025!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'kitaadmin@gmail.com',
      password: hashedAdminPassword,
      name: 'Kita Admin',
      nickname: 'Admin',
      role: 'ADMIN',
      isMember: true,
      contactNumber: '+639123456789',
      referralSource: 'OTHER',
      agreeToNewsletter: true,
    },
  });
  console.log(`✅ Created admin: ${adminUser.email}`);

  // Create Monthly Members
  console.log('\n👥 Creating monthly members...');
  const monthlyMembers = [];
  for (let i = 1; i <= 3; i++) {
    const hashedPassword = await hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: `monthlymember${i}@example.com`,
        password: hashedPassword,
        name: `Monthly Member ${i}`,
        nickname: `MM${i}`,
        role: 'USER',
        isMember: true,
        company: `Company ${i}`,
        contactNumber: `+63912345678${i}`,
        birthdate: new Date('1990-01-01'),
        referralSource: 'SOCIAL_MEDIA',
        agreeToNewsletter: true,
      },
    });
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 2000,
        paymentMethod: 'GCASH',
        status: 'COMPLETED',
        referenceNumber: `GCASH${Date.now()}${i}`,
        paidAt: new Date(),
      },
    });

    await prisma.membership.create({
      data: {
        userId: user.id,
        type: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingAddress: `${i} Main St, Manila, Philippines`,
        paymentId: payment.id,
      },
    });
    
    monthlyMembers.push(user);
    console.log(`✅ Created monthly member: ${user.email}`);
  }

  // Create Daily Use Members
  console.log('\n📅 Creating daily use members...');
  const dailyMembers = [];
  for (let i = 1; i <= 2; i++) {
    const hashedPassword = await hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: `dailymember${i}@example.com`,
        password: hashedPassword,
        name: `Daily Member ${i}`,
        role: 'USER',
        isMember: true,
        contactNumber: `+63912345680${i}`,
        referralSource: 'GOOGLE_MAPS',
        agreeToNewsletter: false,
      },
    });
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 300,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    await prisma.membership.create({
      data: {
        userId: user.id,
        type: 'DAILY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        paymentId: payment.id,
      },
    });
    
    dailyMembers.push(user);
    console.log(`✅ Created daily member: ${user.email}`);
  }

  // Create Member with Coupon
  console.log('\n🎟️  Creating member with coupon...');
  const hashedPassword = await hash('password123', 10);
  const couponUser = await prisma.user.create({
    data: {
      email: 'couponuser@example.com',
      password: hashedPassword,
      name: 'Coupon User',
      role: 'USER',
      isMember: true,
      referralSource: 'WORD_OF_MOUTH',
      agreeToNewsletter: true,
    },
  });

  await prisma.membership.create({
    data: {
      userId: couponUser.id,
      type: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      couponId: freeCoupon.id,
    },
  });

  await prisma.coupon.update({
    where: { id: freeCoupon.id },
    data: { usedCount: { increment: 1 } },
  });
  console.log(`✅ Created member with free coupon`);

  // Create Events
  console.log('\n📅 Creating events...');
  
  // Free Matcha Monday (Redemption Event)
  const matchaMonday = await prisma.event.create({
    data: {
      title: 'Free Matcha Monday',
      description: 'Enjoy a free matcha latte every Monday! Available for daily use and monthly members.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '18:00',
      location: 'Kitaspaces Café',
      price: 0,
      isFree: true,
      isMemberOnly: true,
      isRedemptionEvent: true,
      redemptionLimit: 1,
    },
  });
  
  await prisma.eventFreebie.create({
    data: {
      eventId: matchaMonday.id,
      name: 'Matcha Latte',
      description: 'Premium matcha latte',
      quantity: 100,
    },
  });
  console.log(`✅ Created redemption event: ${matchaMonday.title}`);

  // Workshop with Multiple Pax
  const workshop = await prisma.event.create({
    data: {
      title: 'Team Building Workshop',
      description: 'Bring your team! Register multiple attendees.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '17:00',
      location: 'Kitaspaces Main Hall',
      price: 500,
      isFree: false,
      isMemberOnly: false,
      isFreeForMembers: true, // Free for members
      maxAttendees: 50,
    },
  });

  const workshopFreebies = await prisma.eventFreebie.createMany({
    data: [
      { eventId: workshop.id, name: 'Lunch Box', quantity: 50 },
      { eventId: workshop.id, name: 'Workshop Kit', quantity: 50 },
      { eventId: workshop.id, name: 'T-Shirt', quantity: 50 },
    ],
  });
  console.log(`✅ Created workshop event: ${workshop.title}`);

  // Register for events with multiple pax
  console.log('\n📝 Creating registrations with multiple pax...');
  
  const registration = await prisma.eventRegistration.create({
    data: {
      userId: monthlyMembers[0].id,
      eventId: workshop.id,
      numberOfPax: 3,
    },
  });

  // Add pax details
  const pax1 = await prisma.eventPax.create({
    data: {
      registrationId: registration.id,
      name: 'John Doe',
      email: 'john@example.com',
    },
  });

  const pax2 = await prisma.eventPax.create({
    data: {
      registrationId: registration.id,
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  });

  // Get freebies for the workshop
  const freebies = await prisma.eventFreebie.findMany({
    where: { eventId: workshop.id },
  });

  // Assign freebies to pax
  for (const freebie of freebies) {
    await prisma.paxFreebie.create({
      data: {
        paxId: pax1.id,
        freebieId: freebie.id,
        quantity: 1,
      },
    });

    await prisma.paxFreebie.create({
      data: {
        paxId: pax2.id,
        freebieId: freebie.id,
        quantity: 1,
      },
    });
  }
  console.log(`✅ Created registration with 2 pax and freebies`);

  // Create daily use redemptions
  console.log('\n🎁 Creating daily use redemptions...');
  for (const member of dailyMembers) {
    await prisma.dailyUseRedemption.create({
      data: {
        userId: member.id,
        eventId: matchaMonday.id,
        notes: 'Redeemed Free Matcha Monday',
      },
    });
  }
  console.log(`✅ Created ${dailyMembers.length} redemptions`);

  console.log('\n🎉 Seeding finished successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Monthly Members: ${await prisma.membership.count({ where: { type: 'MONTHLY' } })}`);
  console.log(`   - Daily Members: ${await prisma.membership.count({ where: { type: 'DAILY' } })}`);
  console.log(`   - Coupons: ${await prisma.coupon.count()}`);
  console.log(`   - Events: ${await prisma.event.count()}`);
  console.log(`   - Registrations: ${await prisma.eventRegistration.count()}`);
  console.log(`   - Event Pax: ${await prisma.eventPax.count()}`);
  console.log(`   - Redemptions: ${await prisma.dailyUseRedemption.count()}`);
}

main()
  .catch((e) => {
    console.error('\n💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });