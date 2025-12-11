import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/perks
 * Fetch user's membership perks with upcoming redemption dates
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's active membership with perks
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        plan: {
          include: {
            perks: true,
          },
        },
      },
    });

    if (!membership || !membership.plan) {
      return NextResponse.json({
        success: true,
        data: {
          membership: null,
          perks: [],
        },
      });
    }

    const now = new Date();
    const currentDayOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][now.getDay()];

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Helper function to get next occurrence of a day
    const getNextOccurrence = (dayName: string): Date => {
      const daysOfWeek = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const targetDay = daysOfWeek.indexOf(dayName);
      const currentDay = now.getDay();

      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Next week
      }

      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntilTarget);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate;
    };

    // Process each perk to check availability
    const perksWithAvailability = await Promise.all(
      membership.plan.perks.map(async (perk) => {
        let isAvailable = true;
        let unavailableReason = "";
        let nextAvailableDate: Date | null = null;

        // Check day-specific availability
        if (perk.daysOfWeek) {
          try {
            const allowedDays = JSON.parse(perk.daysOfWeek) as string[];

            if (!allowedDays.includes(currentDayOfWeek)) {
              isAvailable = false;

              // Get next available date
              const upcomingDates = allowedDays.map((day) =>
                getNextOccurrence(day)
              );
              upcomingDates.sort((a, b) => a.getTime() - b.getTime());
              nextAvailableDate = upcomingDates[0] || null;

              unavailableReason = `Next available: ${nextAvailableDate?.toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                }
              )}`;
            }
          } catch (e) {
            console.error("Error parsing daysOfWeek:", e);
          }
        }

        // Check time validity (only if day is available)
        if (perk.validFrom && perk.validUntil && isAvailable) {
          const currentTime = now.toTimeString().slice(0, 5);
          if (currentTime < perk.validFrom) {
            isAvailable = false;
            unavailableReason = `Available from ${perk.validFrom}`;
          } else if (currentTime > perk.validUntil) {
            isAvailable = false;
            // If it's a recurring perk, show next occurrence
            if (perk.isRecurring && perk.daysOfWeek) {
              try {
                const allowedDays = JSON.parse(perk.daysOfWeek) as string[];
                const upcomingDates = allowedDays.map((day) =>
                  getNextOccurrence(day)
                );
                upcomingDates.sort((a, b) => a.getTime() - b.getTime());
                nextAvailableDate = upcomingDates[0] || null;

                unavailableReason = `Next available: ${nextAvailableDate?.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  }
                )}`;
              } catch (_e) {
                unavailableReason = "Time window closed for today";
              }
            } else {
              unavailableReason = "Time window closed for today";
            }
          }
        }

        // Check daily usage
        const todayUsage = await prisma.membershipPerkUsage.count({
          where: {
            membershipId: membership.id,
            perkId: perk.id,
            usedAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        });

        const hasReachedDailyLimit = perk.maxPerDay
          ? todayUsage >= perk.maxPerDay
          : false;

        if (hasReachedDailyLimit) {
          isAvailable = false;

          // Show next available date for recurring perks
          if (perk.isRecurring && perk.daysOfWeek) {
            try {
              const allowedDays = JSON.parse(perk.daysOfWeek) as string[];
              const upcomingDates = allowedDays.map((day) =>
                getNextOccurrence(day)
              );
              upcomingDates.sort((a, b) => a.getTime() - b.getTime());
              nextAvailableDate = upcomingDates[0] || null;

              unavailableReason = `Daily limit reached. Next: ${nextAvailableDate?.toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                }
              )}`;
            } catch (_e) {
              unavailableReason = "Daily limit reached";
            }
          } else {
            unavailableReason = "Daily limit reached";
          }
        }

        // Get last usage date
        const lastUsage = await prisma.membershipPerkUsage.findFirst({
          where: {
            membershipId: membership.id,
            perkId: perk.id,
          },
          orderBy: {
            usedAt: "desc",
          },
        });

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
          usedToday: todayUsage,
          lastUsedAt: lastUsage?.usedAt || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        membership: {
          id: membership.id,
          planName: membership.plan.name,
          status: membership.status,
          endDate: membership.endDate,
        },
        perks: perksWithAvailability,
      },
    });
  } catch (error) {
    console.error("Error fetching perks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch perks" },
      { status: 500 }
    );
  }
}
