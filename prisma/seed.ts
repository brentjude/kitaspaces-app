import { PrismaClient, PerkType } from "../src/generated/prisma";
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

// Helper function to generate event slug
function generateEventSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}

// Helper function to generate payment reference for membership
async function generateMembershipPaymentReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = "mem_kita";

  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
  });

  let nextNumber = 1;

  if (latestPayment?.paymentReference) {
    const match = latestPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}${year}_${nextNumber.toString().padStart(4, "0")}`;
}

// Helper function to generate payment reference for events
async function generateEventPaymentReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = "ev_kita";

  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
  });

  const latestCustomerPayment = await prisma.customerPayment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
  });

  let nextNumber = 1;

  if (latestPayment?.paymentReference) {
    const match = latestPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      nextNumber = Math.max(nextNumber, num + 1);
    }
  }

  if (latestCustomerPayment?.paymentReference) {
    const match = latestCustomerPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      nextNumber = Math.max(nextNumber, num + 1);
    }
  }

  return `${prefix}${year}_${nextNumber.toString().padStart(3, "0")}`;
}

// Helper function to generate meeting room booking reference
async function generateMeetingRoomPaymentReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = "mrb_kita";

  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
  });

  const latestCustomerPayment = await prisma.customerPayment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
  });

  let nextNumber = 1;

  if (latestPayment?.paymentReference) {
    const match = latestPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      nextNumber = Math.max(nextNumber, num + 1);
    }
  }

  if (latestCustomerPayment?.paymentReference) {
    const match = latestCustomerPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      nextNumber = Math.max(nextNumber, num + 1);
    }
  }

  return `${prefix}${year}_${nextNumber.toString().padStart(3, "0")}`;
}

async function main() {
  console.log("🌱 Start seeding...");

  await prisma.$connect();
  console.log("✅ Database connection successful");

  // Clear existing data
  console.log("\n🗑️  Clearing existing data...");
  await prisma.passwordResetToken.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.customerMeetingRoomBooking.deleteMany();
  await prisma.meetingRoomBooking.deleteMany();
  await prisma.meetingRoom.deleteMany();
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
  await prisma.eventCategory.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlanPerk.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customerPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.adminSettings.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleared all data");

  // Create Admin Settings
  console.log("\n⚙️  Creating admin settings...");
  await prisma.adminSettings.create({
    data: {
      bankName: "BDO",
      accountNumber: "1234567890",
      accountName: "KITA Spaces Inc.",
      qrCodeUrl: null,
      qrCodeNumber: "+639123456789",
    },
  });
  console.log("✅ Created admin settings");

  // Create Membership Plans
  console.log("\n📋 Creating membership plans...");

  const basicMonthly = await prisma.membershipPlan.create({
    data: {
      name: "Basic Monthly",
      description: "Perfect for freelancers and solopreneurs",
      type: "MONTHLY",
      price: 2000,
      durationDays: 30,
      isActive: true,
    },
  });

  await prisma.membershipPlanPerk.createMany({
    data: [
      {
        planId: basicMonthly.id,
        perkType: "MEETING_ROOM_HOURS",
        name: "Free Meeting Room Hours",
        description: "Use meeting rooms for free",
        quantity: 4,
        unit: "hours",
        maxPerDay: 2,
      },
      {
        planId: basicMonthly.id,
        perkType: "PRINTING_CREDITS",
        name: "Printing Credits",
        description: "Free printing for documents",
        quantity: 100,
        unit: "pages",
      },
      {
        planId: basicMonthly.id,
        perkType: "EVENT_DISCOUNT",
        name: "Event Discount",
        description: "Discount on paid events",
        quantity: 10,
        unit: "percentage",
      },
      {
        planId: basicMonthly.id,
        perkType: "COFFEE_VOUCHERS",
        name: "Coffee Vouchers",
        description: "Free coffee from the café",
        quantity: 5,
        unit: "vouchers",
      },
      {
        planId: basicMonthly.id,
        perkType: "CUSTOM",
        name: "Free Matcha Monday",
        description: "Get a free matcha latte every Monday",
        quantity: 1,
        unit: "drink",
        daysOfWeek: JSON.stringify(["MONDAY"]),
        isRecurring: true,
        validFrom: "09:00",
        validUntil: "18:00",
        maxPerDay: 1,
      },
    ],
  });
  console.log("✅ Created Basic Monthly plan with perks");

  const premiumMonthly = await prisma.membershipPlan.create({
    data: {
      name: "Premium Monthly",
      description: "For professionals who need more flexibility",
      type: "MONTHLY",
      price: 3500,
      durationDays: 30,
      isActive: true,
    },
  });

  await prisma.membershipPlanPerk.createMany({
    data: [
      {
        planId: premiumMonthly.id,
        perkType: "MEETING_ROOM_HOURS",
        name: "Free Meeting Room Hours",
        description: "Use meeting rooms for free",
        quantity: 10,
        unit: "hours",
        maxPerDay: 4,
      },
      {
        planId: premiumMonthly.id,
        perkType: "PRINTING_CREDITS",
        name: "Printing Credits",
        description: "Free printing for documents",
        quantity: 250,
        unit: "pages",
      },
      {
        planId: premiumMonthly.id,
        perkType: "EVENT_DISCOUNT",
        name: "Event Discount",
        description: "Discount on paid events",
        quantity: 20,
        unit: "percentage",
      },
      {
        planId: premiumMonthly.id,
        perkType: "LOCKER_ACCESS",
        name: "Locker Access",
        description: "Personal locker for storage",
        quantity: 1,
        unit: "locker",
      },
      {
        planId: premiumMonthly.id,
        perkType: "COFFEE_VOUCHERS",
        name: "Coffee Vouchers",
        description: "Free coffee from the café",
        quantity: 15,
        unit: "vouchers",
      },
      {
        planId: premiumMonthly.id,
        perkType: "GUEST_PASSES",
        name: "Guest Passes",
        description: "Bring guests to the space",
        quantity: 3,
        unit: "passes",
      },
      {
        planId: premiumMonthly.id,
        perkType: "CUSTOM",
        name: "Free Matcha Monday",
        description: "Get a free matcha latte every Monday",
        quantity: 1,
        unit: "drink",
        daysOfWeek: JSON.stringify(["MONDAY"]),
        isRecurring: true,
        validFrom: "09:00",
        validUntil: "18:00",
        maxPerDay: 1,
      },
    ],
  });
  console.log("✅ Created Premium Monthly plan with perks");

  const dailyPass = await prisma.membershipPlan.create({
    data: {
      name: "Daily Pass",
      description: "For occasional visitors",
      type: "DAILY",
      price: 300,
      durationDays: 1,
      isActive: true,
    },
  });

  await prisma.membershipPlanPerk.createMany({
    data: [
      {
        planId: dailyPass.id,
        perkType: "COFFEE_VOUCHERS",
        name: "Coffee Voucher",
        description: "One free coffee",
        quantity: 1,
        unit: "vouchers",
      },
      {
        planId: dailyPass.id,
        perkType: "PRINTING_CREDITS",
        name: "Printing Credits",
        description: "Free printing for documents",
        quantity: 10,
        unit: "pages",
      },
      {
        planId: dailyPass.id,
        perkType: "CUSTOM",
        name: "Free Matcha Monday",
        description: "Get a free matcha latte every Monday",
        quantity: 1,
        unit: "drink",
        daysOfWeek: JSON.stringify(["MONDAY"]),
        isRecurring: true,
        validFrom: "09:00",
        validUntil: "18:00",
        maxPerDay: 1,
      },
    ],
  });
  console.log("✅ Created Daily Pass plan with perks");

  // Create Coupons
  console.log("\n🎟️  Creating coupons...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME2025",
      description: "Free first month membership",
      discountType: "FREE",
      discountValue: 100,
      maxUses: 50,
      isActive: true,
      expiresAt: new Date("2025-12-31"),
    },
  });

  await prisma.coupon.create({
    data: {
      code: "SAVE50",
      description: "50% off monthly membership",
      discountType: "PERCENTAGE",
      discountValue: 50,
      maxUses: 100,
      isActive: true,
      expiresAt: new Date("2025-06-30"),
    },
  });
  console.log("✅ Created 2 coupons");

  // Create Event Categories
  console.log("\n🏷️  Creating event categories...");
  const workshopCategory = await prisma.eventCategory.create({
    data: {
      name: "Workshop",
      slug: "workshop",
      description: "Educational and skill-building workshops",
      color: "#3B82F6",
      icon: "🎓",
      isActive: true,
    },
  });

  const networkingCategory = await prisma.eventCategory.create({
    data: {
      name: "Networking",
      slug: "networking",
      description: "Community networking and social events",
      color: "#10B981",
      icon: "🤝",
      isActive: true,
    },
  });

  const dailyPerksCategory = await prisma.eventCategory.create({
    data: {
      name: "Daily Perks",
      slug: "daily-perks",
      description: "Daily redemption perks for members",
      color: "#F59E0B",
      icon: "🎁",
      isActive: true,
    },
  });

  const socialCategory = await prisma.eventCategory.create({
    data: {
      name: "Social",
      slug: "social",
      description: "Fun social gatherings and activities",
      color: "#EC4899",
      icon: "🎉",
      isActive: true,
    },
  });

  console.log("✅ Created 4 event categories");

  // Create Meeting Rooms
  console.log("\n🏢 Creating meeting rooms...");

  const conferenceRoom = await prisma.meetingRoom.create({
    data: {
      name: "Conference Room A",
      description:
        "Large conference room perfect for team meetings and presentations",
      coverPhotoUrl:
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      hourlyRate: 500,
      capacity: 12,
      startTime: "08:00",
      endTime: "20:00",
      amenities: JSON.stringify([
        "Projector",
        "Whiteboard",
        "WiFi",
        "Air Conditioning",
        "TV Screen",
      ]),
      status: "AVAILABLE",
      isActive: true,
      floor: "2nd Floor",
      roomNumber: "2A",
    },
  });

  const smallMeetingRoom = await prisma.meetingRoom.create({
    data: {
      name: "Small Meeting Room B",
      description:
        "Cozy meeting space ideal for 1-on-1 or small team discussions",
      coverPhotoUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      hourlyRate: 300,
      capacity: 4,
      startTime: "08:00",
      endTime: "20:00",
      amenities: JSON.stringify(["Whiteboard", "WiFi", "Air Conditioning"]),
      status: "AVAILABLE",
      isActive: true,
      floor: "2nd Floor",
      roomNumber: "2B",
    },
  });

  await prisma.meetingRoom.create({
    data: {
      name: "Executive Boardroom",
      description:
        "Premium boardroom for executive meetings and client presentations",
      coverPhotoUrl:
        "https://images.unsplash.com/photo-1497366412874-3415097a27e7",
      hourlyRate: 800,
      capacity: 16,
      startTime: "08:00",
      endTime: "20:00",
      amenities: JSON.stringify([
        "Projector",
        "Whiteboard",
        "WiFi",
        "Air Conditioning",
        "Video Conferencing",
        "Coffee Machine",
      ]),
      status: "AVAILABLE",
      isActive: true,
      floor: "3rd Floor",
      roomNumber: "3A",
    },
  });

  console.log("✅ Created 3 meeting rooms");

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
  console.log(`✅ Created admin: ${adminUser.email} (ID: ${adminUser.id})`);

  // Create Monthly Members
  console.log("\n👥 Creating monthly members...");
  const monthlyMembers = [];

  for (let i = 1; i <= 2; i++) {
    const hashedPassword = await hash("password123", 10);
    const userId = await generateUserId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: `basicmember${i}@example.com`,
        password: hashedPassword,
        name: `Basic Member ${i}`,
        nickname: `BM${i}`,
        role: "USER",
        isMember: true,
        company: `Company ${i}`,
        contactNumber: `+63912345678${i}`,
        birthdate: new Date("1990-01-01"),
        referralSource: "SOCIAL_MEDIA",
        agreeToNewsletter: true,
      },
    });

    const paymentRef = await generateMembershipPaymentReference();
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: basicMonthly.price,
        paymentMethod: "GCASH",
        status: "COMPLETED",
        paymentReference: paymentRef,
        referenceNumber: `GCASH${Date.now()}${i}`,
        paidAt: new Date(),
      },
    });

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        planId: basicMonthly.id,
        type: "MONTHLY",
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingAddress: `${i} Main St, Manila, Philippines`,
        paymentId: payment.id,
      },
    });

    const meetingRoomPerk = await prisma.membershipPlanPerk.findFirst({
      where: {
        planId: basicMonthly.id,
        perkType: "MEETING_ROOM_HOURS",
      },
    });

    if (meetingRoomPerk) {
      await prisma.membershipPerkUsage.create({
        data: {
          membershipId: membership.id,
          userId: user.id,
          perkId: meetingRoomPerk.id,
          perkType: PerkType.MEETING_ROOM_HOURS,
          perkName: "Free Meeting Room Hours",
          quantityUsed: 2,
          unit: "hours",
          notes: "Used for client meeting",
          referenceType: "MEETING_ROOM_BOOKING",
        },
      });
    }

    monthlyMembers.push(user);
    console.log(
      `✅ Created basic member: ${user.email} (ID: ${user.id}, Payment Ref: ${paymentRef})`
    );
  }

  // Create Premium Member
  const hashedPassword = await hash("password123", 10);
  const premiumUserId = await generateUserId();
  const premiumUser = await prisma.user.create({
    data: {
      id: premiumUserId,
      email: "premiummember@example.com",
      password: hashedPassword,
      name: "Premium Member",
      nickname: "PM",
      role: "USER",
      isMember: true,
      company: "Premium Corp",
      contactNumber: "+639123456790",
      birthdate: new Date("1985-05-15"),
      referralSource: "GOOGLE_MAPS",
      agreeToNewsletter: true,
    },
  });

  const premiumPaymentRef = await generateMembershipPaymentReference();
  const premiumPayment = await prisma.payment.create({
    data: {
      userId: premiumUser.id,
      amount: premiumMonthly.price,
      paymentMethod: "BANK_TRANSFER",
      status: "COMPLETED",
      paymentReference: premiumPaymentRef,
      referenceNumber: `BANK${Date.now()}`,
      paidAt: new Date(),
    },
  });

  const premiumMembership = await prisma.membership.create({
    data: {
      userId: premiumUser.id,
      planId: premiumMonthly.id,
      type: "MONTHLY",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billingAddress: "Premium Tower, BGC, Taguig City",
      paymentId: premiumPayment.id,
    },
  });

  const premiumMeetingRoomPerk = await prisma.membershipPlanPerk.findFirst({
    where: {
      planId: premiumMonthly.id,
      perkType: "MEETING_ROOM_HOURS",
    },
  });

  const premiumCoffeePerk = await prisma.membershipPlanPerk.findFirst({
    where: {
      planId: premiumMonthly.id,
      perkType: "COFFEE_VOUCHERS",
    },
  });

  const perkUsages: Array<{
    membershipId: string;
    userId: string;
    perkId: string;
    perkType: PerkType;
    perkName: string;
    quantityUsed: number;
    unit: string;
    notes?: string;
  }> = [];

  if (premiumMeetingRoomPerk) {
    perkUsages.push({
      membershipId: premiumMembership.id,
      userId: premiumUser.id,
      perkId: premiumMeetingRoomPerk.id,
      perkType: PerkType.MEETING_ROOM_HOURS,
      perkName: "Free Meeting Room Hours",
      quantityUsed: 5,
      unit: "hours",
      notes: "Team workshop",
    });
  }

  if (premiumCoffeePerk) {
    perkUsages.push({
      membershipId: premiumMembership.id,
      userId: premiumUser.id,
      perkId: premiumCoffeePerk.id,
      perkType: PerkType.COFFEE_VOUCHERS,
      perkName: "Coffee Vouchers",
      quantityUsed: 3,
      unit: "vouchers",
    });
  }

  if (perkUsages.length > 0) {
    await prisma.membershipPerkUsage.createMany({
      data: perkUsages,
    });
  }

  monthlyMembers.push(premiumUser);
  console.log(
    `✅ Created premium member: ${premiumUser.email} (ID: ${premiumUser.id}, Payment Ref: ${premiumPaymentRef})`
  );

  // Create Daily Members
  console.log("\n📅 Creating daily members...");
  const dailyMembers = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 3; i++) {
    const hashedPassword = await hash("password123", 10);
    const userId = await generateUserId();
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: `dailymember${i}@example.com`,
        password: hashedPassword,
        name: `Daily Member ${i}`,
        role: "USER",
        isMember: true,
        contactNumber: `+63912345680${i}`,
        referralSource: "WORD_OF_MOUTH",
        agreeToNewsletter: false,
      },
    });

    const dailyPaymentRef = await generateMembershipPaymentReference();
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: dailyPass.price,
        paymentMethod: "CASH",
        status: "COMPLETED",
        paymentReference: dailyPaymentRef,
        paidAt: today,
      },
    });

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        planId: dailyPass.id,
        type: "DAILY",
        status: "ACTIVE",
        startDate: today,
        endDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        paymentId: payment.id,
      },
    });

    const dailyCoffeePerk = await prisma.membershipPlanPerk.findFirst({
      where: {
        planId: dailyPass.id,
        perkType: "COFFEE_VOUCHERS",
      },
    });

    if (dailyCoffeePerk) {
      await prisma.membershipPerkUsage.create({
        data: {
          membershipId: membership.id,
          userId: user.id,
          perkId: dailyCoffeePerk.id,
          perkType: PerkType.COFFEE_VOUCHERS,
          perkName: "Coffee Voucher",
          quantityUsed: 1,
          unit: "vouchers",
        },
      });
    }

    dailyMembers.push(user);
    console.log(
      `✅ Created daily member: ${user.email} (ID: ${
        user.id
      }, Payment Ref: ${dailyPaymentRef}, Date: ${today.toDateString()})`
    );
  }

  // Create Guest Customers
  console.log("\n👥 Creating guest customers...");
  const guestCustomers = [];

  for (let i = 1; i <= 3; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Guest Customer ${i}`,
        email: `guest${i}@example.com`,
        contactNumber: `+63919876543${i}`,
        company: i === 1 ? "Startup Inc" : undefined,
        referralSource: "SOCIAL_MEDIA",
        notes: "Walk-in guest, no user account",
      },
    });
    guestCustomers.push(customer);
    console.log(
      `✅ Created guest customer: ${customer.name} (ID: ${customer.id})`
    );
  }

  // Create Events
  console.log("\n📅 Creating events...");

  const ramieniacSlug = generateEventSlug("Rameniac Free Ramen Friday");
  const rameniac = await prisma.event.create({
    data: {
      title: "Rameniac - Free Ramen Friday",
      slug: ramieniacSlug,
      description:
        "Get a free bowl of delicious ramen every Friday! Choose from Tonkotsu, Shoyu, or Miso. Available for KITA Spaces members only.",
      date: today,
      startTime: "11:00",
      endTime: "20:00",
      location: "Kitaspaces x Rameniac",
      price: 0,
      isFree: true,
      isMemberOnly: true,
      memberDiscount: 0,
      memberDiscountType: "FIXED",
      memberDiscountedPrice: 0,
      hasCustomerFreebies: false,
      isRedemptionEvent: true,
      redemptionLimit: 1,
      categoryId: dailyPerksCategory.id,
    },
  });

  await prisma.eventFreebie.create({
    data: {
      eventId: rameniac.id,
      name: "Ramen Bowl",
      description:
        "Choose one: Tonkotsu, Shoyu, or Miso - One bowl per customer",
      quantity: 1,
    },
  });
  console.log(
    `✅ Created redemption event: ${rameniac.title} (slug: ${ramieniacSlug})`
  );

  const memberWorkshopSlug = generateEventSlug("Member Exclusive Workshop");
  const memberWorkshop = await prisma.event.create({
    data: {
      title: "Member Exclusive: Digital Marketing Masterclass",
      slug: memberWorkshopSlug,
      description:
        "Exclusive workshop for KITA Spaces members only. Learn advanced digital marketing strategies from industry experts.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: "14:00",
      endTime: "17:00",
      location: "Kitaspaces Main Hall",
      price: 0,
      isFree: true,
      isMemberOnly: true,
      memberDiscount: 0,
      memberDiscountType: "FIXED",
      memberDiscountedPrice: 0,
      hasCustomerFreebies: false,
      maxAttendees: 30,
      categoryId: workshopCategory.id,
    },
  });

  await prisma.eventFreebie.createMany({
    data: [
      {
        eventId: memberWorkshop.id,
        name: "Workshop Materials",
        description: "Notebook and pen",
        quantity: 1,
      },
      {
        eventId: memberWorkshop.id,
        name: "Certificate",
        description: "Digital certificate",
        quantity: 1,
      },
    ],
  });
  console.log(
    `✅ Created member-only event: ${memberWorkshop.title} (slug: ${memberWorkshopSlug})`
  );

  const freeNetworkingSlug = generateEventSlug("Community Networking Night");
  const freeNetworking = await prisma.event.create({
    data: {
      title: "Community Networking Night",
      slug: freeNetworkingSlug,
      description:
        "Free networking event for everyone! Walk-ins welcome. Connect with fellow entrepreneurs, freelancers, and professionals.",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: "18:00",
      endTime: "21:00",
      location: "Kitaspaces Lounge",
      price: 0,
      isFree: true,
      isMemberOnly: false,
      memberDiscount: 0,
      memberDiscountType: "FIXED",
      memberDiscountedPrice: 0,
      hasCustomerFreebies: true,
      maxAttendees: 100,
      categoryId: networkingCategory.id,
    },
  });

  await prisma.eventFreebie.createMany({
    data: [
      {
        eventId: freeNetworking.id,
        name: "Welcome Drink",
        description: "Complimentary beverage",
        quantity: 1,
      },
      {
        eventId: freeNetworking.id,
        name: "Name Tag",
        description: "Personalized name tag",
        quantity: 1,
      },
    ],
  });
  console.log(
    `✅ Created free event: ${freeNetworking.title} (slug: ${freeNetworkingSlug})`
  );

  // 🆕 NEW: Event with member discount (₱800 regular, ₱600 for members - 25% off)
  const paidWorkshopSlug = generateEventSlug("Team Building Workshop");
  const paidWorkshop = await prisma.event.create({
    data: {
      title: "Team Building Workshop",
      slug: paidWorkshopSlug,
      description:
        "Professional team building workshop. Members get 25% discount! Bring your team and learn effective collaboration strategies.",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      startTime: "09:00",
      endTime: "17:00",
      location: "Kitaspaces Main Hall",
      price: 800,
      isFree: false,
      isMemberOnly: false,
      memberDiscount: 25, // 25% discount
      memberDiscountType: "PERCENTAGE",
      memberDiscountedPrice: 600, // ₱800 - 25% = ₱600
      hasCustomerFreebies: true,
      maxAttendees: 50,
      categoryId: workshopCategory.id,
    },
  });

  await prisma.eventFreebie.createMany({
    data: [
      {
        eventId: paidWorkshop.id,
        name: "Lunch Box",
        description: "Healthy lunch meal",
        quantity: 1,
      },
      {
        eventId: paidWorkshop.id,
        name: "Workshop Kit",
        description: "Materials and notebook",
        quantity: 1,
      },
      {
        eventId: paidWorkshop.id,
        name: "T-Shirt",
        description: "Event t-shirt",
        quantity: 1,
      },
    ],
  });
  console.log(
    `✅ Created paid event with member discount: ${paidWorkshop.title} (₱800 regular, ₱600 for members - 25% off)`
  );

  // 🆕 NEW: Event with fixed member discount (₱500 regular, ₱400 for members - ₱100 off)
  const coffeeSocialSlug = generateEventSlug("Morning Coffee Social");
  const coffeeSocial = await prisma.event.create({
    data: {
      title: "Morning Coffee Social",
      slug: coffeeSocialSlug,
      description:
        "Start your day right! Join us for a casual coffee morning. Members save ₱100! Choose your favorite coffee style!",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: "08:00",
      endTime: "10:00",
      location: "Kitaspaces Café",
      price: 500,
      isFree: false,
      isMemberOnly: false,
      memberDiscount: 100, // Fixed ₱100 discount
      memberDiscountType: "FIXED",
      memberDiscountedPrice: 400, // ₱500 - ₱100 = ₱400
      hasCustomerFreebies: false, // Members only get freebies
      maxAttendees: 40,
      categoryId: socialCategory.id,
    },
  });

  await prisma.eventFreebie.create({
    data: {
      eventId: coffeeSocial.id,
      name: "Coffee Choice",
      description: "Choose one: Latte, Americano, Cappuccino",
      quantity: 1,
    },
  });
  console.log(
    `✅ Created coffee event with fixed member discount: ${coffeeSocial.title} (₱500 regular, ₱400 for members - ₱100 off)`
  );

  // Create Meeting Room Bookings
  console.log("\n📅 Creating meeting room bookings...");

  // User booking
  const userBookingPaymentRef = await generateMeetingRoomPaymentReference();
  const userBookingPayment = await prisma.payment.create({
    data: {
      userId: monthlyMembers[0].id,
      amount: conferenceRoom.hourlyRate * 3,
      paymentMethod: "GCASH",
      status: "COMPLETED",
      paymentReference: userBookingPaymentRef,
      referenceNumber: `GCASH${Date.now()}`,
      paidAt: new Date(),
      notes: `Meeting Room: ${conferenceRoom.name} | Date: ${new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toLocaleDateString()}`,
    },
  });

  await prisma.meetingRoomBooking.create({
    data: {
      userId: monthlyMembers[0].id,
      roomId: conferenceRoom.id,
      bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: "09:00",
      endTime: "12:00",
      duration: 3,
      contactName: monthlyMembers[0].name,
      contactEmail: monthlyMembers[0].email,
      contactMobile: monthlyMembers[0].contactNumber,
      numberOfAttendees: 8,
      purpose: "Team strategy meeting",
      status: "CONFIRMED",
      totalAmount: conferenceRoom.hourlyRate * 3,
      paymentId: userBookingPayment.id,
    },
  });
  console.log(
    `✅ Created user booking for ${conferenceRoom.name} (Ref: ${userBookingPaymentRef})`
  );

  // Customer booking
  const customerBookingPaymentRef = await generateMeetingRoomPaymentReference();
  const customerBookingPayment = await prisma.customerPayment.create({
    data: {
      customerId: guestCustomers[0].id,
      amount: smallMeetingRoom.hourlyRate * 2,
      paymentMethod: "CASH",
      status: "PENDING",
      paymentReference: customerBookingPaymentRef,
      notes: `Meeting Room: ${smallMeetingRoom.name} | Date: ${new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toLocaleDateString()}`,
    },
  });

  await prisma.customerMeetingRoomBooking.create({
    data: {
      customerId: guestCustomers[0].id,
      roomId: smallMeetingRoom.id,
      bookingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: "14:00",
      endTime: "16:00",
      duration: 2,
      contactPerson: guestCustomers[0].name,
      contactName: guestCustomers[0].name,
      contactEmail: guestCustomers[0].email!,
      contactPhone: guestCustomers[0].contactNumber!,
      contactMobile: guestCustomers[0].contactNumber!,
      numberOfAttendees: 3,
      purpose: "MEETING",
      status: "PENDING",
      totalAmount: smallMeetingRoom.hourlyRate * 2,
      paymentId: customerBookingPayment.id,
    },
  });
  console.log(
    `✅ Created customer booking for ${smallMeetingRoom.name} (Ref: ${customerBookingPaymentRef})`
  );

  // Event registrations
  console.log("\n📝 Creating event registrations...");

  const workshopFreebies = await prisma.eventFreebie.findMany({
    where: { eventId: paidWorkshop.id },
  });

  // 🆕 Member registration with discount
  const memberEventPaymentRef = await generateEventPaymentReference();
  const memberEventPayment = await prisma.payment.create({
    data: {
      userId: monthlyMembers[0].id,
      amount: 600 * 2, // Member price (₱600) for 2 people
      paymentMethod: "GCASH",
      status: "COMPLETED",
      paymentReference: memberEventPaymentRef,
      referenceNumber: `GCASH${Date.now()}`,
      paidAt: new Date(),
      notes: `Event registration: ${paidWorkshop.title} | Member discount applied: 25% | Original: ₱${
        800 * 2
      }, Discounted: ₱${600 * 2}`,
    },
  });

  const memberReg1 = await prisma.eventRegistration.create({
    data: {
      userId: monthlyMembers[0].id,
      eventId: paidWorkshop.id,
      attendeeName: monthlyMembers[0].name,
      attendeeEmail: monthlyMembers[0].email,
      numberOfPax: 2,
      paymentId: memberEventPayment.id,
    },
  });

  const memberPax1 = await prisma.eventPax.create({
    data: {
      registrationId: memberReg1.id,
      name: monthlyMembers[0].name,
      email: monthlyMembers[0].email,
    },
  });

  const memberPax2 = await prisma.eventPax.create({
    data: {
      registrationId: memberReg1.id,
      name: "John Doe",
      email: "john@example.com",
    },
  });

  for (const freebie of workshopFreebies) {
    await prisma.paxFreebie.createMany({
      data: [
        { paxId: memberPax1.id, freebieId: freebie.id, quantity: 1 },
        { paxId: memberPax2.id, freebieId: freebie.id, quantity: 1 },
      ],
    });
  }
  console.log(
    `✅ Member ${monthlyMembers[0].name} registered for ${paidWorkshop.title} with 25% discount (₱1,200 paid instead of ₱1,600)`
  );

  // Guest registration (paying full price)
  const guestEventPaymentRef = await generateEventPaymentReference();
  const guestEventPayment = await prisma.customerPayment.create({
    data: {
      customerId: guestCustomers[0].id,
      amount: 800, // Full price
      paymentMethod: "BANK_TRANSFER",
      status: "COMPLETED",
      paymentReference: guestEventPaymentRef,
      referenceNumber: `BANK${Date.now()}`,
      paidAt: new Date(),
      notes: `Event registration: ${paidWorkshop.title} | Full price (no member discount)`,
    },
  });

  const guestReg = await prisma.customerEventRegistration.create({
    data: {
      customerId: guestCustomers[0].id,
      eventId: paidWorkshop.id,
      attendeeName: guestCustomers[0].name,
      attendeeEmail: guestCustomers[0].email!,
      attendeePhone: guestCustomers[0].contactNumber!,
      numberOfPax: 1,
      paymentId: guestEventPayment.id,
    },
  });

  const guestPax = await prisma.customerEventPax.create({
    data: {
      registrationId: guestReg.id,
      name: guestCustomers[0].name,
      email: guestCustomers[0].email!,
      phone: guestCustomers[0].contactNumber!,
    },
  });

  for (const freebie of workshopFreebies) {
    await prisma.customerPaxFreebie.create({
      data: {
        paxId: guestPax.id,
        freebieId: freebie.id,
        quantity: 1,
      },
    });
  }
  console.log(
    `✅ Guest ${guestCustomers[0].name} registered for ${paidWorkshop.title} at full price (₱800)`
  );

  // Coffee event with member discount
  const coffeeEventPaymentRef = await generateEventPaymentReference();
  const coffeeEventPayment = await prisma.payment.create({
    data: {
      userId: dailyMembers[0].id,
      amount: 400, // Member price (₱400)
      paymentMethod: "GCASH",
      status: "COMPLETED",
      paymentReference: coffeeEventPaymentRef,
      referenceNumber: `GCASH${Date.now()}`,
      paidAt: new Date(),
      notes: `Event registration: ${coffeeSocial.title} | Member discount applied: ₱100 | Original: ₱500, Discounted: ₱400`,
    },
  });

  const dailyReg = await prisma.eventRegistration.create({
    data: {
      userId: dailyMembers[0].id,
      eventId: coffeeSocial.id,
      attendeeName: dailyMembers[0].name,
      attendeeEmail: dailyMembers[0].email,
      numberOfPax: 1,
      paymentId: coffeeEventPayment.id,
    },
  });

  const dailyPax = await prisma.eventPax.create({
    data: {
      registrationId: dailyReg.id,
      name: dailyMembers[0].name,
      email: dailyMembers[0].email,
    },
  });

  const coffeeFreebie = await prisma.eventFreebie.findFirst({
    where: { eventId: coffeeSocial.id },
  });

  if (coffeeFreebie) {
    await prisma.paxFreebie.create({
      data: {
        paxId: dailyPax.id,
        freebieId: coffeeFreebie.id,
        quantity: 1,
        option: "Latte",
      },
    });
  }
  console.log(
    `✅ Daily member ${dailyMembers[0].name} registered for ${coffeeSocial.title} with ₱100 discount (₱400 paid instead of ₱500)`
  );

  // Free event registration
  const guestFreeReg = await prisma.customerEventRegistration.create({
    data: {
      customerId: guestCustomers[1].id,
      eventId: freeNetworking.id,
      attendeeName: guestCustomers[1].name,
      attendeeEmail: guestCustomers[1].email!,
      attendeePhone: guestCustomers[1].contactNumber!,
      numberOfPax: 1,
    },
  });

  const guestFreePax = await prisma.customerEventPax.create({
    data: {
      registrationId: guestFreeReg.id,
      name: guestCustomers[1].name,
      email: guestCustomers[1].email!,
      phone: guestCustomers[1].contactNumber!,
    },
  });

  const networkingFreebies = await prisma.eventFreebie.findMany({
    where: { eventId: freeNetworking.id },
  });

  for (const freebie of networkingFreebies) {
    await prisma.customerPaxFreebie.create({
      data: {
        paxId: guestFreePax.id,
        freebieId: freebie.id,
        quantity: 1,
      },
    });
  }

  console.log(
    `✅ Guest ${guestCustomers[1].name} registered for ${freeNetworking.title}`
  );

  // Daily use redemptions
  console.log("\n🎁 Creating daily use redemptions...");

  for (const member of dailyMembers.slice(0, 2)) {
    const ramenOptions = ["Tonkotsu", "Shoyu", "Miso"];
    const chosenOption =
      ramenOptions[Math.floor(Math.random() * ramenOptions.length)];

    await prisma.dailyUseRedemption.create({
      data: {
        userId: member.id,
        eventId: rameniac.id,
        redeemedAt: today,
        notes: `Redeemed Rameniac Free Ramen Friday - ${chosenOption}`,
      },
    });
  }
  console.log(
    `✅ Created ${2} user redemptions for Rameniac with different options`
  );

  console.log("\n🎉 Seeding finished successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - User ID Format: YYYYNNN (e.g., ${adminUserId})`);
  console.log(`   - Monthly Members: ${monthlyMembers.length}`);
  console.log(
    `   - Daily Members: ${dailyMembers.length} (Date: ${today.toDateString()})`
  );
  console.log(`   - Guest Customers: ${guestCustomers.length}`);
  console.log(`   - Membership Plans: ${await prisma.membershipPlan.count()}`);
  console.log(`   - Meeting Rooms: ${await prisma.meetingRoom.count()}`);
  console.log(`   - User Bookings: ${await prisma.meetingRoomBooking.count()}`);
  console.log(
    `   - Customer Bookings: ${await prisma.customerMeetingRoomBooking.count()}`
  );
  console.log(`   - Events: ${await prisma.event.count()}`);
  console.log(
    `   - User Registrations: ${await prisma.eventRegistration.count()}`
  );
  console.log(
    `   - Guest Registrations: ${await prisma.customerEventRegistration.count()}`
  );
  console.log(`   - User Payments: ${await prisma.payment.count()}`);
  console.log(`   - Guest Payments: ${await prisma.customerPayment.count()}`);
  console.log(
    `   - Daily Redemptions: ${await prisma.dailyUseRedemption.count()}`
  );

  console.log("\n📅 Events Created:");
  const events = await prisma.event.findMany({
    select: {
      title: true,
      slug: true,
      isMemberOnly: true,
      isFree: true,
      price: true,
      memberDiscount: true,
      memberDiscountType: true,
      memberDiscountedPrice: true,
      hasCustomerFreebies: true,
    },
  });
  events.forEach((e) => {
    let type = "";
    if (e.isMemberOnly) {
      type = "[Members Only]";
    } else if (e.isFree) {
      type = "[Free]";
    } else if (e.memberDiscount && e.memberDiscount > 0) {
      const discountText =
        e.memberDiscountType === "PERCENTAGE"
          ? `${e.memberDiscount}% off`
          : `₱${e.memberDiscount} off`;
      type = `[₱${e.price} / ₱${e.memberDiscountedPrice} for Members (${discountText})]`;
    } else {
      type = `[₱${e.price}]`;
    }
    console.log(`   - ${e.title} ${type}`);
    console.log(`     Slug: ${e.slug}`);
    console.log(
      `     Customer Freebies: ${e.hasCustomerFreebies ? "Yes" : "Members Only"}`
    );
  });

  console.log("\n💰 Payment References:");
  const samplePayments = await prisma.payment.findMany({
    select: { paymentReference: true, amount: true, notes: true },
    take: 5,
  });

  const sampleCustomerPayments = await prisma.customerPayment.findMany({
    select: { paymentReference: true, amount: true, notes: true },
    take: 2,
  });

  console.log("   User Payments:");
  samplePayments.forEach((p) => {
    console.log(`   - ${p.paymentReference} (₱${p.amount}) ${p.notes || ""}`);
  });

  console.log("   Guest Payments:");
  sampleCustomerPayments.forEach((p) => {
    console.log(`   - ${p.paymentReference} (₱${p.amount}) ${p.notes || ""}`);
  });

  console.log("\n💳 Member Discount Examples:");
  console.log(
    `   - Team Building Workshop: ₱800 → ₱600 for members (25% off)`
  );
  console.log(
    `   - Morning Coffee Social: ₱500 → ₱400 for members (₱100 off)`
  );
  console.log(
    `   - Member saved: ₱200 (Workshop) + ₱100 (Coffee) = ₱300 total savings`
  );
}

main()
  .catch((e) => {
    console.error("\n💥 Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });