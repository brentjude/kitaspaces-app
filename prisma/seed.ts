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
      id: 'desc',
    },
  });

  let nextNumber = 1;

  if (latestUser) {
    const lastNumber = parseInt(latestUser.id.slice(-3));
    nextNumber = lastNumber + 1;
  }

  return `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;
}

async function main() {
  console.log('🌱 Start seeding...');

  await prisma.$connect();
  console.log('✅ Database connection successful');

  // Clear existing data
  console.log('\n🗑️  Clearing existing data...');
  await prisma.membershipPerkUsage.deleteMany();
  await prisma.customerDailyUseRedemption.deleteMany();
  await prisma.dailyUseRedemption.deleteMany();
  await prisma.customerPaxFreebie.deleteMany();
  await prisma.paxFreebie.deleteMany();
  await prisma.customerEventPax.deleteMany();
  await prisma.eventPax.deleteMany();
  await prisma.customerEventRegistration.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.eventFreebie.deleteMany();
  await prisma.event.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlanPerk.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customerPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared all data');

  // Create Membership Plans
  console.log('\n📋 Creating membership plans...');
  
  // Basic Monthly Plan
  const basicMonthly = await prisma.membershipPlan.create({
    data: {
      name: 'Basic Monthly',
      description: 'Perfect for freelancers and solopreneurs',
      type: 'MONTHLY',
      price: 2000,
      durationDays: 30,
      isActive: true,
    },
  });

  await prisma.membershipPlanPerk.createMany({
    data: [
      {
        planId: basicMonthly.id,
        perkType: 'MEETING_ROOM_HOURS',
        name: 'Free Meeting Room Hours',
        description: 'Use meeting rooms for free',
        quantity: 4,
        unit: 'hours',
        maxPerDay: 2,
      },
      {
        planId: basicMonthly.id,
        perkType: 'PRINTING_CREDITS',
        name: 'Printing Credits',
        description: 'Free printing for documents',
        quantity: 100,
        unit: 'pages',
      },
      {
        planId: basicMonthly.id,
        perkType: 'EVENT_DISCOUNT',
        name: 'Event Discount',
        description: 'Discount on paid events',
        quantity: 10,
        unit: 'percentage',
      },
      {
        planId: basicMonthly.id,
        perkType: 'COFFEE_VOUCHERS',
        name: 'Coffee Vouchers',
        description: 'Free coffee from the café',
        quantity: 5,
        unit: 'vouchers',
      },
    ],
  });
  console.log(`✅ Created Basic Monthly plan with perks`);

  // Premium Monthly Plan
  const premiumMonthly = await prisma.membershipPlan.create({
    data: {
      name: 'Premium Monthly',
      description: 'For professionals who need more flexibility',
      type: 'MONTHLY',
      price: 3500,
      durationDays: 30,
      isActive: true,
    },
  });

  await prisma.membershipPlanPerk.createMany({
    data: [
      {
        planId: premiumMonthly.id,
        perkType: 'MEETING_ROOM_HOURS',
        name: 'Free Meeting Room Hours',
        description: 'Use meeting rooms for free',
        quantity: 10,
        unit: 'hours',
        maxPerDay: 4,
      },
      {
        planId: premiumMonthly.id,
        perkType: 'PRINTING_CREDITS',
        name: 'Printing Credits',
        description: 'Free printing for documents',
        quantity: 250,
        unit: 'pages',
      },
      {
        planId: premiumMonthly.id,
        perkType: 'EVENT_DISCOUNT',
        name: 'Event Discount',
        description: 'Discount on paid events',
        quantity: 20,
        unit: 'percentage',
      },
      {
        planId: premiumMonthly.id,
        perkType: 'LOCKER_ACCESS',
        name: 'Locker Access',
        description: 'Personal locker for storage',
        quantity: 1,
        unit: 'locker',
      },
      {
        planId: premiumMonthly.id,
        perkType: 'COFFEE_VOUCHERS',
        name: 'Coffee Vouchers',
        description: 'Free coffee from the café',
        quantity: 15,
        unit: 'vouchers',
      },
      {
        planId: premiumMonthly.id,
        perkType: 'GUEST_PASSES',
        name: 'Guest Passes',
        description: 'Bring guests to the space',
        quantity: 3,
        unit: 'passes',
      },
    ],
  });
  console.log(`✅ Created Premium Monthly plan with perks`);

  // Daily Pass Plan
  const dailyPass = await prisma.membershipPlan.create({
    data: {
      name: 'Daily Pass',
      description: 'For occasional visitors',
      type: 'DAILY',
      price: 300,
      durationDays: 1,
      isActive: true,
    },
  });

  await prisma.membershipPlanPerk.createMany({
    data: [
      {
        planId: dailyPass.id,
        perkType: 'COFFEE_VOUCHERS',
        name: 'Coffee Voucher',
        description: 'One free coffee',
        quantity: 1,
        unit: 'vouchers',
      },
      {
        planId: dailyPass.id,
        perkType: 'PRINTING_CREDITS',
        name: 'Printing Credits',
        description: 'Free printing for documents',
        quantity: 10,
        unit: 'pages',
      },
    ],
  });
  console.log(`✅ Created Daily Pass plan with perks`);

  // Create Coupons
  console.log('\n🎟️  Creating coupons...');
  await prisma.coupon.create({
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

  await prisma.coupon.create({
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

// Create Event Categories
console.log('\n🏷️  Creating event categories...');
const workshopCategory = await prisma.eventCategory.create({
  data: {
    name: 'Workshop',
    slug: 'workshop',
    description: 'Educational and skill-building workshops',
    color: '#3B82F6', // Blue
    icon: '🎓',
    isActive: true,
  },
});

const networkingCategory = await prisma.eventCategory.create({
  data: {
    name: 'Networking',
    slug: 'networking',
    description: 'Community networking and social events',
    color: '#10B981', // Green
    icon: '🤝',
    isActive: true,
  },
});

  const dailyUseCategory = await prisma.eventCategory.create({
  data: {
    name: 'Daily Perks',
    slug: 'daily-perks',
    description: 'Daily redemption perks for members',
    color: '#F59E0B', // Orange
    icon: '🎁',
    isActive: true,
  },
});

const socialCategory = await prisma.eventCategory.create({
  data: {
    name: 'Social',
    slug: 'social',
    description: 'Fun social gatherings and activities',
    color: '#EC4899', // Pink
    icon: '🎉',
    isActive: true,
  },
});

console.log(`✅ Created 4 event categories`);

  // Create Admin User
  console.log('\n👤 Creating admin user...');
  const hashedAdminPassword = await hash('KITA@boombox2025!', 10);
  const adminUserId = await generateUserId();
  const adminUser = await prisma.user.create({
    data: {
      id: adminUserId,
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
  console.log(`✅ Created admin: ${adminUser.email} (ID: ${adminUser.id})`);

  // Create Monthly Members with Plans
  console.log('\n👥 Creating monthly members...');
  const monthlyMembers = [];
  
  for (let i = 1; i <= 2; i++) {
    const hashedPassword = await hash('password123', 10);
    const userId = await generateUserId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: `basicmember${i}@example.com`,
        password: hashedPassword,
        name: `Basic Member ${i}`,
        nickname: `BM${i}`,
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
        amount: basicMonthly.price,
        paymentMethod: 'GCASH',
        status: 'COMPLETED',
        referenceNumber: `GCASH${Date.now()}${i}`,
        paidAt: new Date(),
      },
    });

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        planId: basicMonthly.id,
        type: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingAddress: `${i} Main St, Manila, Philippines`,
        paymentId: payment.id,
      },
    });

    // Simulate perk usage
    await prisma.membershipPerkUsage.create({
      data: {
        membershipId: membership.id,
        userId: user.id,
        perkType: 'MEETING_ROOM_HOURS',
        perkName: 'Free Meeting Room Hours',
        quantityUsed: 2,
        unit: 'hours',
        notes: 'Used for client meeting',
        referenceType: 'MEETING_ROOM_BOOKING',
      },
    });
    
    monthlyMembers.push(user);
    console.log(`✅ Created basic member: ${user.email} (ID: ${user.id})`);
  }

  // Create Premium Member
  const hashedPassword = await hash('password123', 10);
  const premiumUserId = await generateUserId();
  const premiumUser = await prisma.user.create({
    data: {
      id: premiumUserId,
      email: 'premiummember@example.com',
      password: hashedPassword,
      name: 'Premium Member',
      nickname: 'PM',
      role: 'USER',
      isMember: true,
      company: 'Premium Corp',
      contactNumber: '+639123456790',
      birthdate: new Date('1985-05-15'),
      referralSource: 'GOOGLE_MAPS',
      agreeToNewsletter: true,
    },
  });

  const premiumPayment = await prisma.payment.create({
    data: {
      userId: premiumUser.id,
      amount: premiumMonthly.price,
      paymentMethod: 'BANK_TRANSFER',
      status: 'COMPLETED',
      referenceNumber: `BANK${Date.now()}`,
      paidAt: new Date(),
    },
  });

  const premiumMembership = await prisma.membership.create({
    data: {
      userId: premiumUser.id,
      planId: premiumMonthly.id,
      type: 'MONTHLY',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billingAddress: 'Premium Tower, BGC, Taguig City',
      paymentId: premiumPayment.id,
    },
  });

  await prisma.membershipPerkUsage.createMany({
    data: [
      {
        membershipId: premiumMembership.id,
        userId: premiumUser.id,
        perkType: 'MEETING_ROOM_HOURS',
        perkName: 'Free Meeting Room Hours',
        quantityUsed: 5,
        unit: 'hours',
        notes: 'Team workshop',
      },
      {
        membershipId: premiumMembership.id,
        userId: premiumUser.id,
        perkType: 'COFFEE_VOUCHERS',
        perkName: 'Coffee Vouchers',
        quantityUsed: 3,
        unit: 'vouchers',
      },
    ],
  });
  monthlyMembers.push(premiumUser);
  console.log(`✅ Created premium member: ${premiumUser.email} (ID: ${premiumUser.id})`);

  // Create Daily Members
  console.log('\n📅 Creating daily members...');
  const dailyMembers = [];
  for (let i = 1; i <= 2; i++) {
    const hashedPassword = await hash('password123', 10);
    const userId = await generateUserId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: `dailymember${i}@example.com`,
        password: hashedPassword,
        name: `Daily Member ${i}`,
        role: 'USER',
        isMember: true,
        contactNumber: `+63912345680${i}`,
        referralSource: 'WORD_OF_MOUTH',
        agreeToNewsletter: false,
      },
    });
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: dailyPass.price,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        planId: dailyPass.id,
        type: 'DAILY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        paymentId: payment.id,
      },
    });

    await prisma.membershipPerkUsage.create({
      data: {
        membershipId: membership.id,
        userId: user.id,
        perkType: 'COFFEE_VOUCHERS',
        perkName: 'Coffee Voucher',
        quantityUsed: 1,
        unit: 'vouchers',
      },
    });
    
    dailyMembers.push(user);
    console.log(`✅ Created daily member: ${user.email} (ID: ${user.id})`);
  }

  // Create Guest Customers (not registered users)
  console.log('\n👥 Creating guest customers...');
  const guestCustomers = [];
  
  for (let i = 1; i <= 3; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Guest Customer ${i}`,
        email: `guest${i}@example.com`,
        contactNumber: `+63919876543${i}`,
        company: i === 1 ? 'Startup Inc' : undefined,
        referralSource: 'SOCIAL_MEDIA',
        notes: 'Walk-in guest, no user account',
      },
    });
    guestCustomers.push(customer);
    console.log(`✅ Created guest customer: ${customer.name} (ID: ${customer.id})`);
  }

  // Create a customer that will later link to a user (simulating someone who signs up after being a guest)
  const futureUserCustomer = await prisma.customer.create({
    data: {
      name: 'Future User',
      email: 'futureuser@example.com',
      contactNumber: '+639191234567',
      referralSource: 'GOOGLE_MAPS',
      notes: 'Initially a guest, later created account',
    },
  });
  console.log(`✅ Created future user customer: ${futureUserCustomer.name}`);

  // Create the user account for the future user (linking customer to user)
  const futureUserId = await generateUserId();
  const futureUserAccount = await prisma.user.create({
    data: {
      id: futureUserId,
      email: 'futureuser@example.com',
      password: await hash('password123', 10),
      name: 'Future User',
      contactNumber: '+639191234567',
      role: 'USER',
      isMember: false,
      referralSource: 'GOOGLE_MAPS',
      agreeToNewsletter: true,
    },
  });

  // Link the customer to the user
  await prisma.customer.update({
    where: { id: futureUserCustomer.id },
    data: { userId: futureUserAccount.id },
  });
  console.log(`✅ Linked customer to user account: ${futureUserAccount.email}`);

  // Create Events
  console.log('\n📅 Creating events...');
  
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
      categoryId: dailyUseCategory.id,
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
      isFreeForMembers: true,
      maxAttendees: 50,
      categoryId: dailyUseCategory.id,
    },
  });

  await prisma.eventFreebie.createMany({
    data: [
      { eventId: workshop.id, name: 'Lunch Box', quantity: 50 },
      { eventId: workshop.id, name: 'Workshop Kit', quantity: 50 },
      { eventId: workshop.id, name: 'T-Shirt', quantity: 50 },
    ],
  });
  console.log(`✅ Created workshop event: ${workshop.title}`);

  // Create a free public event (open to everyone including guests)
  const networkingEvent = await prisma.event.create({
    data: {
      title: 'Community Networking Night',
      description: 'Free networking event for everyone! Walk-ins welcome.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      startTime: '18:00',
      endTime: '21:00',
      location: 'Kitaspaces Lounge',
      price: 0,
      isFree: true,
      isMemberOnly: false,
      maxAttendees: 100,
      categoryId: dailyUseCategory.id,
    },
  });

  await prisma.eventFreebie.createMany({
    data: [
      { eventId: networkingEvent.id, name: 'Welcome Drink', quantity: 100 },
      { eventId: networkingEvent.id, name: 'Name Tag', quantity: 100 },
    ],
  });
  console.log(`✅ Created networking event: ${networkingEvent.title}`);

  // Register for events with multiple pax (User registration)
  console.log('\n📝 Creating user registrations with multiple pax...');
  
  const registration = await prisma.eventRegistration.create({
    data: {
      userId: monthlyMembers[0].id,
      eventId: workshop.id,
      numberOfPax: 3,
    },
  });

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

  const workshopFreebies = await prisma.eventFreebie.findMany({
    where: { eventId: workshop.id },
  });

  for (const freebie of workshopFreebies) {
    await prisma.paxFreebie.createMany({
      data: [
        { paxId: pax1.id, freebieId: freebie.id, quantity: 1 },
        { paxId: pax2.id, freebieId: freebie.id, quantity: 1 },
      ],
    });
  }
  console.log(`✅ Created user registration with 2 pax and freebies`);

  // Guest customer registrations for events
  console.log('\n👤 Creating guest customer event registrations...');
  
  // Guest 1 registers for networking event (free event)
  const guestReg1 = await prisma.customerEventRegistration.create({
    data: {
      customerId: guestCustomers[0].id,
      eventId: networkingEvent.id,
      attendeeName: guestCustomers[0].name,
      attendeeEmail: guestCustomers[0].email!,
      attendeePhone: guestCustomers[0].contactNumber!,
      numberOfPax: 1,
    },
  });
  console.log(`✅ Guest ${guestCustomers[0].name} registered for ${networkingEvent.title}`);

  // Guest 2 registers for workshop (paid event) with payment
  const guestPayment = await prisma.customerPayment.create({
    data: {
      customerId: guestCustomers[1].id,
      amount: workshop.price,
      paymentMethod: 'GCASH',
      status: 'COMPLETED',
      referenceNumber: `GCASH-GUEST-${Date.now()}`,
      paidAt: new Date(),
    },
  });

  const guestReg2 = await prisma.customerEventRegistration.create({
    data: {
      customerId: guestCustomers[1].id,
      eventId: workshop.id,
      attendeeName: guestCustomers[1].name,
      attendeeEmail: guestCustomers[1].email!,
      attendeePhone: guestCustomers[1].contactNumber!,
      numberOfPax: 2,
      paymentId: guestPayment.id,
    },
  });

  // Create pax for guest registration
  const guestPax1 = await prisma.customerEventPax.create({
    data: {
      registrationId: guestReg2.id,
      name: 'Guest Attendee 1',
      email: 'guest.attendee1@example.com',
      phone: '+639191111111',
    },
  });

  const networkingFreebies = await prisma.eventFreebie.findMany({
    where: { eventId: networkingEvent.id },
  });

  for (const freebie of networkingFreebies) {
    await prisma.customerPaxFreebie.create({
      data: {
        paxId: guestPax1.id,
        freebieId: freebie.id,
        quantity: 1,
      },
    });
  }
  console.log(`✅ Guest ${guestCustomers[1].name} registered for ${workshop.title} with payment and pax`);

  // Guest 3 registers for networking event with multiple pax
  const guestReg3 = await prisma.customerEventRegistration.create({
    data: {
      customerId: guestCustomers[2].id,
      eventId: networkingEvent.id,
      attendeeName: guestCustomers[2].name,
      attendeeEmail: guestCustomers[2].email!,
      numberOfPax: 3,
    },
  });

  const guestPax2 = await prisma.customerEventPax.create({
    data: {
      registrationId: guestReg3.id,
      name: 'Team Member A',
      email: 'teama@example.com',
    },
  });

  const guestPax3 = await prisma.customerEventPax.create({
    data: {
      registrationId: guestReg3.id,
      name: 'Team Member B',
      email: 'teamb@example.com',
    },
  });
  console.log(`✅ Guest ${guestCustomers[2].name} registered for ${networkingEvent.title} with 2 additional pax`);

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
  console.log(`✅ Created ${dailyMembers.length} user redemptions`);

  console.log('\n🎉 Seeding finished successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - User ID Format: YYYYNNN (e.g., 2025001, 2025002)`);
  console.log(`   - Guest Customers: ${await prisma.customer.count({ where: { userId: null } })}`);
  console.log(`   - Linked Customers: ${await prisma.customer.count({ where: { userId: { not: null } } })}`);
  console.log(`   - Total Customers: ${await prisma.customer.count()}`);
  console.log(`   - Membership Plans: ${await prisma.membershipPlan.count()}`);
  console.log(`   - Plan Perks: ${await prisma.membershipPlanPerk.count()}`);
  console.log(`   - Memberships: ${await prisma.membership.count()}`);
  console.log(`   - Perk Usages: ${await prisma.membershipPerkUsage.count()}`);
  console.log(`   - Coupons: ${await prisma.coupon.count()}`);
  console.log(`   - Event Categories: ${await prisma.eventCategory.count()}`);
  console.log(`   - Events: ${await prisma.event.count()}`);
  console.log(`   - User Registrations: ${await prisma.eventRegistration.count()}`);
  console.log(`   - Guest Registrations: ${await prisma.customerEventRegistration.count()}`);
  console.log(`   - User Event Pax: ${await prisma.eventPax.count()}`);
  console.log(`   - Guest Event Pax: ${await prisma.customerEventPax.count()}`);
  console.log(`   - User Redemptions: ${await prisma.dailyUseRedemption.count()}`);
  console.log(`   - Guest Redemptions: ${await prisma.customerDailyUseRedemption.count()}`);
  console.log(`   - User Payments: ${await prisma.payment.count()}`);
  console.log(`   - Guest Payments: ${await prisma.customerPayment.count()}`);
}

main()
  .catch((e) => {
    console.error('\n💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });