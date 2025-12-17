import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ActivityAction } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Prisma.ActivityLogWhereInput = {
      userId: session.user.id,
    };

    // Filter by action type (only user actions, no admin actions)
    if (action && action !== "all") {
      if (action === "payment") {
        where.action = {
          in: [
            ActivityAction.PAYMENT_INITIATED,
            ActivityAction.PAYMENT_COMPLETED,
            ActivityAction.PAYMENT_FAILED,
            ActivityAction.PAYMENT_REFUNDED,
            ActivityAction.PAYMENT_VERIFIED,
          ],
        };
      } else if (action === "event") {
        where.action = {
          in: [
            ActivityAction.EVENT_REGISTRATION,
            ActivityAction.EVENT_CANCELLATION,
            ActivityAction.EVENT_ATTENDANCE,
          ],
        };
      } else if (action === "booking") {
        where.action = {
          in: [
            ActivityAction.ROOM_BOOKING_CREATED,
            ActivityAction.ROOM_BOOKING_CONFIRMED,
            ActivityAction.ROOM_BOOKING_CANCELLED,
            ActivityAction.ROOM_BOOKING_CHECKIN,
            ActivityAction.ROOM_BOOKING_CHECKOUT,
          ],
        };
      } else if (action === "membership") {
        where.action = {
          in: [
            ActivityAction.MEMBERSHIP_PURCHASE,
            ActivityAction.MEMBERSHIP_RENEWAL,
            ActivityAction.MEMBERSHIP_CANCELLATION,
            ActivityAction.MEMBERSHIP_EXPIRY,
          ],
        };
      } else if (action === "profile") {
        where.action = {
          in: [
            ActivityAction.PROFILE_UPDATE,
            ActivityAction.EMAIL_CHANGE,
            ActivityAction.PASSWORD_CHANGE,
          ],
        };
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          description: true,
          referenceId: true,
          referenceType: true,
          createdAt: true,
          isSuccess: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch user activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
