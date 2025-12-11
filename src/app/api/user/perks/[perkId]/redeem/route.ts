import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/perks/[perkId]/redeem
 * Redeem a membership perk (e.g., Free Matcha Monday)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ perkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const perkId = params.perkId;
    const body = await request.json();
    const { notes } = body;

    // Get user's active membership with perks
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
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
      return NextResponse.json(
        { success: false, error: "No active membership found" },
        { status: 400 }
      );
    }

    // Get the specific perk
    const perk = membership.plan.perks.find((p) => p.id === perkId);

    if (!perk) {
      return NextResponse.json(
        { success: false, error: "Perk not found in your membership plan" },
        { status: 404 }
      );
    }

    // Check if perk is available today
    const now = new Date();
    const dayOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][now.getDay()];

    // Check day-specific perks
    if (perk.daysOfWeek) {
      try {
        const allowedDays = JSON.parse(perk.daysOfWeek) as string[];
        if (!allowedDays.includes(dayOfWeek)) {
          return NextResponse.json(
            {
              success: false,
              error: `This perk is only available on: ${allowedDays.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }
      } catch (e) {
        console.error("Error parsing daysOfWeek:", e);
      }
    }

    // Check time validity
    if (perk.validFrom && perk.validUntil) {
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
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

    // Check daily usage limit
    if (perk.maxPerDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

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

      if (todayUsage >= perk.maxPerDay) {
        return NextResponse.json(
          {
            success: false,
            error: `Daily limit reached. You can use this perk ${perk.maxPerDay} time(s) per day.`,
          },
          { status: 400 }
        );
      }
    }

    // Check weekly usage limit
    if (perk.maxPerWeek) {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const weekUsage = await prisma.membershipPerkUsage.count({
        where: {
          membershipId: membership.id,
          perkId: perk.id,
          usedAt: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
        },
      });

      if (weekUsage >= perk.maxPerWeek) {
        return NextResponse.json(
          {
            success: false,
            error: `Weekly limit reached. You can use this perk ${perk.maxPerWeek} time(s) per week.`,
          },
          { status: 400 }
        );
      }
    }

    // Create usage record with all required fields
    const usage = await prisma.membershipPerkUsage.create({
      data: {
        membershipId: membership.id,
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
