import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLogger";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ perkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { perkId } = params;
    const body = await request.json();

    const perk = await prisma.membershipPlanPerk.findUnique({
      where: { id: perkId },
    });

    if (!perk) {
      return NextResponse.json(
        { success: false, error: "Perk not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const activeMembership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        plan: {
          include: {
            perks: true,
          },
        },
      },
    });

    if (!activeMembership || !activeMembership.plan) {
      return NextResponse.json(
        { success: false, error: "No active membership found" },
        { status: 400 }
      );
    }

    const membershipPerk = activeMembership.plan.perks.find(
      (p) => p.id === perkId
    );

    if (!membershipPerk) {
      return NextResponse.json(
        { success: false, error: "Perk not found in your membership plan" },
        { status: 400 }
      );
    }

    // ✅ Calculate time boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    monthEnd.setHours(0, 0, 0, 0);

    // ✅ Count actual usage from database for this specific perk
    const [todayUsageCount, weekUsageCount, monthUsageCount] =
      await Promise.all([
        prisma.membershipPerkUsage.count({
          where: {
            membershipId: activeMembership.id,
            perkId: perkId,
            usedAt: { gte: todayStart, lt: todayEnd },
          },
        }),
        prisma.membershipPerkUsage.count({
          where: {
            membershipId: activeMembership.id,
            perkId: perkId,
            usedAt: { gte: weekStart, lt: weekEnd },
          },
        }),
        prisma.membershipPerkUsage.count({
          where: {
            membershipId: activeMembership.id,
            perkId: perkId,
            usedAt: { gte: monthStart, lt: monthEnd },
          },
        }),
      ]);

    // Handle MEETING_ROOM_HOURS perk type
    if (perk.perkType === "MEETING_ROOM_HOURS") {
      const {
        roomId,
        bookingDate,
        startTime,
        endTime,
        duration,
        numberOfAttendees,
        purpose,
        notes,
      } = body;

      if (!roomId || !bookingDate || !startTime || !endTime || !duration) {
        return NextResponse.json(
          { success: false, error: "Missing required booking details" },
          { status: 400 }
        );
      }

      if (duration <= 0 || typeof duration !== "number") {
        return NextResponse.json(
          { success: false, error: "Invalid duration value" },
          { status: 400 }
        );
      }

      const bookingDateTime = new Date(bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDateTime < today) {
        return NextResponse.json(
          { success: false, error: "Cannot book for past dates" },
          { status: 400 }
        );
      }

      const usedToday = await prisma.membershipPerkUsage.aggregate({
        where: {
          membershipId: activeMembership.id,
          perkId: perkId,
          usedAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        _sum: {
          quantityUsed: true,
        },
      });

      const totalUsedToday = usedToday._sum.quantityUsed || 0;
      const availableHours = membershipPerk.quantity - totalUsedToday;

      if (duration > availableHours) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient hours. You have ${availableHours} hours available today.`,
          },
          { status: 400 }
        );
      }

      if (
        membershipPerk.maxPerDay &&
        totalUsedToday + duration > membershipPerk.maxPerDay
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Daily limit exceeded. Maximum ${membershipPerk.maxPerDay} hours per day.`,
          },
          { status: 400 }
        );
      }

      const room = await prisma.meetingRoom.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, error: "Meeting room not found" },
          { status: 404 }
        );
      }

      if (!room.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: "This meeting room is currently unavailable",
          },
          { status: 400 }
        );
      }

      const conflictingBookings = await prisma.meetingRoomBooking.count({
        where: {
          roomId,
          bookingDate: bookingDateTime,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBookings > 0) {
        return NextResponse.json(
          { success: false, error: "This time slot is already booked" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const perkUsage = await tx.membershipPerkUsage.create({
          data: {
            membershipId: activeMembership.id,
            userId: session.user.id,
            perkId: perkId,
            perkType: "MEETING_ROOM_HOURS",
            perkName: membershipPerk.name,
            quantityUsed: duration,
            unit: membershipPerk.unit,
            notes: notes || `Meeting room booking: ${duration} hours`,
          },
        });

        const booking = await tx.meetingRoomBooking.create({
          data: {
            userId: session.user.id,
            roomId,
            bookingDate: bookingDateTime,
            startTime,
            endTime,
            duration,
            company: user.company,
            contactName: user.name,
            contactEmail: user.email,
            contactMobile: user.contactNumber,
            numberOfAttendees: numberOfAttendees || 1,
            purpose: purpose || "MEETING",
            status: "CONFIRMED",
            totalAmount: 0,
            isUsingMembershipPerk: true,
            membershipPerkUsageId: perkUsage.id,
            notes,
          },
          include: {
            room: true,
          },
        });

        return { perkUsage, booking };
      });

      await logActivity({
        userId: session.user.id,
        action: "PERK_USED",
        description: `Used ${duration} ${membershipPerk.unit} of ${membershipPerk.name} for meeting room booking`,
        referenceId: result.booking.id,
        referenceType: "MEETING_ROOM_BOOKING",
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });

      return NextResponse.json({
        success: true,
        data: {
          message: `Successfully booked ${result.booking.room.name} for ${duration} hours`,
          booking: {
            id: result.booking.id,
            roomName: result.booking.room.name,
            date: result.booking.bookingDate,
            startTime: result.booking.startTime,
            endTime: result.booking.endTime,
            duration: result.booking.duration,
          },
          perkUsage: {
            id: result.perkUsage.id,
            quantityUsed: result.perkUsage.quantityUsed,
            remainingToday: availableHours - duration,
          },
        },
      });
    }

    // ✅ Handle other perk types - Check limits in priority order: Monthly > Weekly > Daily
    const { notes } = body;
    const dayOfWeek = now.getDay();

    // Check day-specific perks
    if (perk.daysOfWeek) {
      try {
        const daysOfWeekStr = perk.daysOfWeek.trim();

        if (daysOfWeekStr && daysOfWeekStr !== '""' && daysOfWeekStr !== "''") {
          const allowedDays = JSON.parse(daysOfWeekStr) as string[];

          const normalizedAllowedDays = allowedDays
            .map((d) => String(d).trim())
            .filter((d) => d !== "");

          if (
            normalizedAllowedDays.length > 0 &&
            normalizedAllowedDays.length < 7
          ) {
            const dayOfWeekStr = String(dayOfWeek);

            if (!normalizedAllowedDays.includes(dayOfWeekStr)) {
              const dayNames = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ];

              const allowedDayNames = normalizedAllowedDays
                .map((d) => {
                  const num = parseInt(d);
                  return !isNaN(num) && num >= 0 && num <= 6
                    ? dayNames[num]
                    : null;
                })
                .filter((d): d is string => d !== null);

              return NextResponse.json(
                {
                  success: false,
                  error: `This perk is only available on: ${allowedDayNames.join(", ")}`,
                },
                { status: 400 }
              );
            }
          }
        }
      } catch (e) {
        console.error("Error parsing daysOfWeek:", e);
      }
    }

    // Check time validity
    if (perk.validFrom && perk.validUntil) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (currentTime < perk.validFrom || currentTime > perk.validUntil) {
        return NextResponse.json(
          {
            success: false,
            error: `This perk is only available between ${perk.validFrom} and ${perk.validUntil}`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ Check limits in priority order: Monthly > Weekly > Daily

    // 1. Check monthly usage limit FIRST (strictest)
    if (perk.maxPerMonth !== null && perk.maxPerMonth !== undefined) {
      if (monthUsageCount >= perk.maxPerMonth) {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return NextResponse.json(
          {
            success: false,
            error: `Monthly limit reached. You can use this perk ${perk.maxPerMonth} time(s) per month. Available again on ${nextMonth.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Check weekly usage limit SECOND
    if (perk.maxPerWeek !== null && perk.maxPerWeek !== undefined) {
      if (weekUsageCount >= perk.maxPerWeek) {
        return NextResponse.json(
          {
            success: false,
            error: `Weekly limit reached. You can use this perk ${perk.maxPerWeek} time(s) per week.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Check daily usage limit LAST (least strict)
    if (perk.maxPerDay !== null && perk.maxPerDay !== undefined) {
      if (todayUsageCount >= perk.maxPerDay) {
        return NextResponse.json(
          {
            success: false,
            error: `Daily limit reached. You can use this perk ${perk.maxPerDay} time(s) per day.`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ Create usage record
    const usage = await prisma.membershipPerkUsage.create({
      data: {
        membershipId: activeMembership.id,
        userId: session.user.id,
        perkId: perk.id,
        perkType: perk.perkType,
        perkName: perk.name,
        quantityUsed: 1,
        unit: perk.unit,
        notes: notes || `Redeemed ${perk.name}`,
      },
      include: {
        perk: true,
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "PERK_USED",
      description: `Redeemed ${perk.name}`,
      referenceId: usage.id,
      referenceType: "MEMBERSHIP_PERK_USAGE",
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        usageId: usage.id,
        perk: {
          id: perk.id,
          name: perk.name,
          description: perk.description,
          type: perk.perkType,
        },
        usedAt: usage.usedAt,
        remainingToday:
          perk.maxPerDay !== null
            ? perk.maxPerDay - (todayUsageCount + 1)
            : null,
        remainingThisWeek:
          perk.maxPerWeek !== null
            ? perk.maxPerWeek - (weekUsageCount + 1)
            : null,
        remainingThisMonth:
          perk.maxPerMonth !== null
            ? perk.maxPerMonth - (monthUsageCount + 1)
            : null,
        message: `Successfully redeemed: ${perk.name}`,
      },
    });
  } catch (error) {
    console.error("Perk redemption error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to redeem perk",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
