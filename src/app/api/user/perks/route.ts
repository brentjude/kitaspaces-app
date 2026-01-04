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

    const perksWithAvailability: MembershipPerk[] = await Promise.all(
      activeMembership.plan.perks.map(async (perk) => {
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

        // ✅ For meeting room hours, use SUM (aggregate hours)
        // ✅ For other perks, use COUNT (number of redemptions)
        const isMeetingRoomHours = perk.perkType === "MEETING_ROOM_HOURS";

        let usedToday = 0;
        let usedThisWeek = 0;
        let usedThisMonth = 0;

        if (isMeetingRoomHours) {
          // Use aggregate SUM for meeting room hours
          const [todayUsage, weekUsage, monthUsage] = await Promise.all([
            prisma.membershipPerkUsage.aggregate({
              where: {
                membershipId: activeMembership.id,
                perkId: perk.id,
                usedAt: { gte: todayStart, lt: todayEnd },
              },
              _sum: { quantityUsed: true },
            }),
            prisma.membershipPerkUsage.aggregate({
              where: {
                membershipId: activeMembership.id,
                perkId: perk.id,
                usedAt: { gte: weekStart, lt: weekEnd },
              },
              _sum: { quantityUsed: true },
            }),
            prisma.membershipPerkUsage.aggregate({
              where: {
                membershipId: activeMembership.id,
                perkId: perk.id,
                usedAt: { gte: monthStart, lt: monthEnd },
              },
              _sum: { quantityUsed: true },
            }),
          ]);

          usedToday = todayUsage._sum.quantityUsed || 0;
          usedThisWeek = weekUsage._sum.quantityUsed || 0;
          usedThisMonth = monthUsage._sum.quantityUsed || 0;
        } else {
          // Use COUNT for regular perks (number of redemptions)
          const [todayCount, weekCount, monthCount] = await Promise.all([
            prisma.membershipPerkUsage.count({
              where: {
                membershipId: activeMembership.id,
                perkId: perk.id,
                usedAt: { gte: todayStart, lt: todayEnd },
              },
            }),
            prisma.membershipPerkUsage.count({
              where: {
                membershipId: activeMembership.id,
                perkId: perk.id,
                usedAt: { gte: weekStart, lt: weekEnd },
              },
            }),
            prisma.membershipPerkUsage.count({
              where: {
                membershipId: activeMembership.id,
                perkId: perk.id,
                usedAt: { gte: monthStart, lt: monthEnd },
              },
            }),
          ]);

          usedToday = todayCount;
          usedThisWeek = weekCount;
          usedThisMonth = monthCount;
        }

        const lastUsage = await prisma.membershipPerkUsage.findFirst({
          where: {
            membershipId: activeMembership.id,
            perkId: perk.id,
          },
          orderBy: {
            usedAt: "desc",
          },
        });

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

              const normalizedAllowedDays = allowedDays
                .map((d) => String(d).trim())
                .filter((d) => d !== "");

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

                  // ✅ Find next available day
                  const allowedDayNums = normalizedAllowedDays.map((d) =>
                    parseInt(d)
                  );
                  let daysToAdd = 1;
                  for (let i = 0; i < 7; i++) {
                    const checkDay = (currentDay + daysToAdd) % 7;
                    if (allowedDayNums.includes(checkDay)) {
                      nextAvailableDate = new Date(now);
                      nextAvailableDate.setDate(now.getDate() + daysToAdd);
                      nextAvailableDate.setHours(0, 0, 0, 0);
                      break;
                    }
                    daysToAdd++;
                  }
                }
              }
            }
          } catch (e) {
            console.error(`Error parsing daysOfWeek for ${perk.name}:`, e);
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

        // ✅ Check limits in priority order: Monthly > Weekly > Daily

        // 3. Check monthly limit FIRST (strictest)
        if (
          isAvailable &&
          perk.maxPerMonth !== null &&
          perk.maxPerMonth !== undefined
        ) {
          if (usedThisMonth >= perk.maxPerMonth) {
            isAvailable = false;
            unavailableReason = `Monthly limit reached`;
            // ✅ Set to first day of NEXT month, considering day restrictions
            const baseNextMonth = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1,
              0,
              0,
              0,
              0
            );

            // If perk has day restrictions, find first valid day in next month
            if (perk.daysOfWeek) {
              try {
                const daysOfWeekStr = perk.daysOfWeek.trim();
                if (
                  daysOfWeekStr &&
                  daysOfWeekStr !== '""' &&
                  daysOfWeekStr !== "''"
                ) {
                  const allowedDays = JSON.parse(daysOfWeekStr) as string[];
                  const allowedDayNums = allowedDays
                    .map((d) => parseInt(d.trim()))
                    .filter((d) => !isNaN(d));

                  if (allowedDayNums.length > 0 && allowedDayNums.length < 7) {
                    // Find first valid day in next month
                    const firstDayOfNextMonth = baseNextMonth.getDay();
                    let daysToAdd = 0;

                    for (let i = 0; i < 7; i++) {
                      const checkDay = (firstDayOfNextMonth + i) % 7;
                      if (allowedDayNums.includes(checkDay)) {
                        daysToAdd = i;
                        break;
                      }
                    }

                    nextAvailableDate = new Date(baseNextMonth);
                    nextAvailableDate.setDate(
                      baseNextMonth.getDate() + daysToAdd
                    );
                  } else {
                    nextAvailableDate = baseNextMonth;
                  }
                } else {
                  nextAvailableDate = baseNextMonth;
                }
              } catch {
                nextAvailableDate = baseNextMonth;
              }
            } else {
              nextAvailableDate = baseNextMonth;
            }
          }
        }

        // 4. Check weekly limit SECOND
        if (
          isAvailable &&
          perk.maxPerWeek !== null &&
          perk.maxPerWeek !== undefined
        ) {
          if (usedThisWeek >= perk.maxPerWeek) {
            isAvailable = false;
            unavailableReason = `Weekly limit reached`;
            nextAvailableDate = new Date(weekEnd);
          }
        }

        // 5. Check daily limit LAST (least strict)
        if (
          isAvailable &&
          perk.maxPerDay !== null &&
          perk.maxPerDay !== undefined
        ) {
          if (usedToday >= perk.maxPerDay) {
            isAvailable = false;
            unavailableReason = `Daily limit reached`;
            nextAvailableDate = new Date(todayEnd);
          }
        }

        // 6. For meeting room hours, check remaining quantity
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

        // 7. Check membership expiry
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
          maxPerMonth: perk.maxPerMonth,
          daysOfWeek: perk.daysOfWeek,
          isRecurring: perk.isRecurring,
          validFrom: perk.validFrom,
          validUntil: perk.validUntil,
          isAvailable,
          unavailableReason,
          nextAvailableDate: nextAvailableDate
            ? nextAvailableDate.toISOString()
            : null,
          usedToday,
          usedThisWeek,
          usedThisMonth,
          lastUsedAt: lastUsage?.usedAt ? lastUsage.usedAt.toISOString() : null,
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
          startDate: activeMembership.startDate.toISOString(),
          endDate: activeMembership.endDate
            ? activeMembership.endDate.toISOString()
            : null,
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
