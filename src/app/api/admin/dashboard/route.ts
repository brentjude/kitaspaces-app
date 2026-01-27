import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, addDays, differenceInDays } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // ✅ 1. Total Users Stats
    const [totalUsers, usersThisMonth, usersLastMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay(thirtyDaysAgo),
            lte: endOfDay(now),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay(subDays(thirtyDaysAgo, 30)),
            lt: startOfDay(thirtyDaysAgo),
          },
        },
      }),
    ]);

    const userGrowthPercentage =
      usersLastMonth > 0
        ? Math.round(
            ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
          )
        : 0;

    // ✅ 2. Upcoming Events Stats
    const [upcomingEvents, upcomingEventsThisMonth, upcomingEventsLastMonth] =
      await Promise.all([
        prisma.event.count({
          where: {
            date: {
              gte: now,
            },
          },
        }),
        prisma.event.count({
          where: {
            date: {
              gte: now,
              lte: endOfDay(subDays(now, -30)),
            },
          },
        }),
        prisma.event.count({
          where: {
            date: {
              gte: subDays(now, 30),
              lt: now,
            },
          },
        }),
      ]);

    const eventGrowthPercentage =
      upcomingEventsLastMonth > 0
        ? Math.round(
            ((upcomingEventsThisMonth - upcomingEventsLastMonth) /
              upcomingEventsLastMonth) *
              100
          )
        : 0;

    // ✅ 3. Total Revenue Stats
    const [totalRevenue, revenueThisMonth, revenueLastMonth] =
      await Promise.all([
        prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
            paidAt: {
              gte: startOfDay(thirtyDaysAgo),
              lte: endOfDay(now),
            },
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
            paidAt: {
              gte: startOfDay(subDays(thirtyDaysAgo, 30)),
              lt: startOfDay(thirtyDaysAgo),
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

    const [
      totalCustomerRevenue,
      customerRevenueThisMonth,
      customerRevenueLastMonth,
    ] = await Promise.all([
      prisma.customerPayment.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.customerPayment.aggregate({
        where: {
          status: "COMPLETED",
          paidAt: {
            gte: startOfDay(thirtyDaysAgo),
            lte: endOfDay(now),
          },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.customerPayment.aggregate({
        where: {
          status: "COMPLETED",
          paidAt: {
            gte: startOfDay(subDays(thirtyDaysAgo, 30)),
            lt: startOfDay(thirtyDaysAgo),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalRevenueAmount =
      (totalRevenue._sum.amount || 0) +
      (totalCustomerRevenue._sum.amount || 0);
    const thisMonthRevenue =
      (revenueThisMonth._sum.amount || 0) +
      (customerRevenueThisMonth._sum.amount || 0);
    const lastMonthRevenue =
      (revenueLastMonth._sum.amount || 0) +
      (customerRevenueLastMonth._sum.amount || 0);

    const revenueGrowthPercentage =
      lastMonthRevenue > 0
        ? Math.round(
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          )
        : 0;

    // ✅ 4. Recent Users (Last 5 registered users)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isMember: true,
        role: true,
      },
    });

    // ✅ 5. Upcoming Events (Next 5 events)
    const upcomingEventsList = await prisma.event.findMany({
      where: {
        date: {
          gte: now,
        },
      },
      take: 5,
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        location: true,
        price: true,
        isFree: true,
        _count: {
          select: {
            registrations: true,
            customerRegistrations: true,
          },
        },
      },
    });

    // ✅ 6. Additional Stats
    const [
      activeMembersCount,
      pendingPaymentsCount,
      todayBookingsCount,
      totalMeetingRooms,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          isMember: true,
          memberships: {
            some: {
              status: "ACTIVE",
            },
          },
        },
      }),
      prisma.payment.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.meetingRoomBooking.count({
        where: {
          bookingDate: {
            gte: startOfDay(now),
            lte: endOfDay(now),
          },
        },
      }),
      prisma.meetingRoom.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    // ✅ 7. Upcoming Birthdays (Next 30 days, only users with birthdate)
    const usersWithBirthdays = await prisma.user.findMany({
      where: {
        birthdate: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        company: true,
        birthdate: true,
      },
    });

    const upcomingBirthdays = usersWithBirthdays
      .map((user) => {
        const birthdate = user.birthdate!;
        const nextBirthday = getNextBirthday(birthdate);
        const daysUntil = differenceInDays(nextBirthday, startOfDay(now));

        return {
          id: user.id,
          name: user.name,
          company: user.company,
          birthdate: birthdate.toISOString(),
          nextBirthday,
          daysUntil,
        };
      })
      .filter((user) => user.daysUntil >= 0 && user.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // ✅ 8. Expiring Memberships (Next 30 days)
    const expiringMemberships = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          not: null,
          gte: startOfDay(now),
          lte: endOfDay(addDays(now, 30)),
        },
      },
      orderBy: {
        endDate: "asc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: {
            value: totalUsers,
            change: userGrowthPercentage,
            trend: userGrowthPercentage >= 0 ? "up" : "down",
          },
          upcomingEvents: {
            value: upcomingEvents,
            change: eventGrowthPercentage,
            trend: eventGrowthPercentage >= 0 ? "up" : "down",
          },
          totalRevenue: {
            value: totalRevenueAmount,
            formatted: `₱${totalRevenueAmount.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            change: revenueGrowthPercentage,
            trend: revenueGrowthPercentage >= 0 ? "up" : "down",
          },
          activeMembers: {
            value: activeMembersCount,
          },
          pendingPayments: {
            value: pendingPaymentsCount,
          },
          todayBookings: {
            value: todayBookingsCount,
          },
          totalMeetingRooms: {
            value: totalMeetingRooms,
          },
        },

        recentUsers: recentUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          timeAgo: getTimeAgo(user.createdAt),
        })),

        upcomingEvents: upcomingEventsList.map((event) => {
          const totalAttendees =
            event._count.registrations + event._count.customerRegistrations;
          return {
            id: event.id,
            title: event.title,
            date: event.date.toISOString(),
            startTime: event.startTime,
            location: event.location,
            price: event.price,
            isFree: event.isFree,
            attendees: totalAttendees,
            formattedDate: formatEventDate(event.date, event.startTime),
          };
        }),

        upcomingBirthdays: upcomingBirthdays.map((user) => ({
          id: user.id,
          name: user.name,
          company: user.company,
          birthdate: user.birthdate,
          daysUntil: user.daysUntil,
          formattedDate: formatBirthdayDate(user.nextBirthday),
        })),

        expiringMemberships: expiringMemberships.map((membership) => {
          const daysLeft = membership.endDate
            ? differenceInDays(membership.endDate, startOfDay(now))
            : 0;

          return {
            id: membership.id,
            userId: membership.user.id,
            userName: membership.user.name,
            userEmail: membership.user.email,
            planName: membership.plan?.name || "N/A",
            endDate: membership.endDate?.toISOString() || null,
            daysLeft,
            formattedEndDate: membership.endDate
              ? formatDate(membership.endDate)
              : "N/A",
          };
        }),
      },
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ Helper: Get next birthday occurrence
function getNextBirthday(birthdate: Date): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  let nextBirthday = new Date(
    currentYear,
    birthdate.getMonth(),
    birthdate.getDate()
  );

  if (nextBirthday < now) {
    nextBirthday = new Date(
      currentYear + 1,
      birthdate.getMonth(),
      birthdate.getDate()
    );
  }

  return nextBirthday;
}

// ✅ Helper: Format birthday date
function formatBirthdayDate(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// ✅ Helper: Format date
function formatDate(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ✅ Helper: Calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

// ✅ Helper: Format event date
function formatEventDate(date: Date, startTime: string | null): string {
  const now = new Date();
  const eventDate = new Date(date);

  if (
    eventDate.getDate() === now.getDate() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getFullYear() === now.getFullYear()
  ) {
    return `Today${startTime ? `, ${startTime}` : ""}`;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (
    eventDate.getDate() === tomorrow.getDate() &&
    eventDate.getMonth() === tomorrow.getMonth() &&
    eventDate.getFullYear() === tomorrow.getFullYear()
  ) {
    return `Tomorrow${startTime ? `, ${startTime}` : ""}`;
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[eventDate.getMonth()];
  const day = eventDate.getDate();
  const year = eventDate.getFullYear();

  return `${month} ${day}, ${year}${startTime ? `, ${startTime}` : ""}`;
}