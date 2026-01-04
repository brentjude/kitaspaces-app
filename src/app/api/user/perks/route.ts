import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembershipPerk } from "@/types/dashboard";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Get active membership with proper date validation
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
      orderBy: {
        startDate: "desc",
      },
    });

    if (!activeMembership || !activeMembership.plan) {
      return NextResponse.json({
        success: true,
        data: {
          membership: null,
          perks: [],
        },
      });
    }

    // Calculate perk availability
    const perksWithAvailability: MembershipPerk[] = await Promise.all(
      activeMembership.plan.perks.map(async (perk) => {
        // Get today's start and end
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        // Get this week's start and end (Sunday to Saturday)
        const weekStart = new Date(todayStart);
        weekStart.setDate(todayStart.getDate() - todayStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        // Count usage today
        const todayUsage = await prisma.membershipPerkUsage.aggregate({
          where: {
            membershipId: activeMembership.id,
            perkId: perk.id,
            usedAt: {
              gte: todayStart,
              lt: todayEnd,
            },
          },
          _sum: {
            quantityUsed: true,
          },
        });

        // Count usage this week
        const weekUsage = await prisma.membershipPerkUsage.aggregate({
          where: {
            membershipId: activeMembership.id,
            perkId: perk.id,
            usedAt: {
              gte: weekStart,
              lt: weekEnd,
            },
          },
          _sum: {
            quantityUsed: true,
          },
        });

        // Get last usage
        const lastUsage = await prisma.membershipPerkUsage.findFirst({
          where: {
            membershipId: activeMembership.id,
            perkId: perk.id,
          },
          orderBy: {
            usedAt: "desc",
          },
        });

        const usedToday = todayUsage._sum.quantityUsed || 0;
        const usedThisWeek = weekUsage._sum.quantityUsed || 0;

        // Check availability conditions
        let isAvailable = true;
        let unavailableReason = "";
        let nextAvailableDate: Date | null = null;

        // 1. Check day of week
        if (perk.daysOfWeek) {
          try {
            const daysOfWeekStr = perk.daysOfWeek.trim();

            if (
              daysOfWeekStr &&
              daysOfWeekStr !== '""' &&
              daysOfWeekStr !== "''"
            ) {
              const allowedDays = JSON.parse(daysOfWeekStr) as string[];
              const currentDay = now.getDay();

              // Normalize allowed days - trim and ensure they're strings
              const normalizedAllowedDays = allowedDays
                .map((d) => String(d).trim())
                .filter((d) => d !== "");

              // Only check if it's not all 7 days
              if (
                normalizedAllowedDays.length > 0 &&
                normalizedAllowedDays.length < 7
              ) {
                const currentDayStr = String(currentDay);

                if (!normalizedAllowedDays.includes(currentDayStr)) {
                  isAvailable = false;
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
                      const dayNum = parseInt(d);
                      return !isNaN(dayNum) && dayNum >= 0 && dayNum <= 6
                        ? dayNames[dayNum]
                        : null;
                    })
                    .filter((d): d is string => d !== null)
                    .sort((a, b) => {
                      const aIndex = dayNames.indexOf(a);
                      const bIndex = dayNames.indexOf(b);
                      return aIndex - bIndex;
                    });

                  unavailableReason = `Available on ${allowedDayNames.join(", ")}`;
                }
              }
            }
          } catch (e) {
            console.error(`Error parsing daysOfWeek for ${perk.name}:`, e);
            console.error("daysOfWeek value:", perk.daysOfWeek);
          }
        }

        // 2. Check time range
        if (isAvailable && perk.validFrom && perk.validUntil) {
          const currentTime = now.toTimeString().slice(0, 5);

          if (currentTime < perk.validFrom || currentTime > perk.validUntil) {
            isAvailable = false;
            unavailableReason = `Available ${perk.validFrom} - ${perk.validUntil}`;
          }
        }

        // 3. Check daily limit
        if (isAvailable && perk.maxPerDay !== null) {
          if (usedToday >= perk.maxPerDay) {
            isAvailable = false;
            unavailableReason = `Daily limit reached`;
            const tomorrow = new Date(todayEnd);
            nextAvailableDate = tomorrow;
          }
        }

        // 4. Check weekly limit
        if (isAvailable && perk.maxPerWeek !== null) {
          if (usedThisWeek >= perk.maxPerWeek) {
            isAvailable = false;
            unavailableReason = `Weekly limit reached`;
            nextAvailableDate = new Date(weekEnd);
          }
        }

        // 5. For meeting room hours, check remaining quantity
        if (isAvailable && perk.perkType === "MEETING_ROOM_HOURS") {
          const remainingQuantity = perk.quantity - usedToday;

          if (remainingQuantity <= 0) {
            isAvailable = false;
            unavailableReason = perk.isRecurring
              ? "No hours remaining today"
              : "All hours used";
            if (perk.isRecurring) {
              nextAvailableDate = new Date(todayEnd);
            }
          }
        }

        // 6. Check membership expiry
        if (
          isAvailable &&
          activeMembership.endDate &&
          activeMembership.endDate < now
        ) {
          isAvailable = false;
          unavailableReason = "Membership expired";
        }

        return {
          id: perk.id,
          name: perk.name,
          description: perk.description,
          type: perk.perkType,
          quantity: perk.quantity,
          unit: perk.unit,
          maxPerDay: perk.maxPerDay,
          maxPerWeek: perk.maxPerWeek,
          daysOfWeek: perk.daysOfWeek,
          isRecurring: perk.isRecurring,
          validFrom: perk.validFrom,
          validUntil: perk.validUntil,
          isAvailable,
          unavailableReason,
          nextAvailableDate,
          usedToday,
          lastUsedAt: lastUsage?.usedAt || null,
        } as MembershipPerk;
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        membership: {
          id: activeMembership.id,
          planName: activeMembership.plan.name,
          status: activeMembership.status,
          startDate: activeMembership.startDate,
          endDate: activeMembership.endDate,
        },
        perks: perksWithAvailability,
      },
    });
  } catch (error) {
    console.error("Error fetching user perks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch perks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
