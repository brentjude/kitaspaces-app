import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ActivityAction } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Prisma.ActivityLogWhereInput = {};

    // Filter by action type
    if (action && action !== "all") {
      if (action === "admin") {
        // All admin actions
        where.action = {
          in: [
            ActivityAction.ADMIN_USER_CREATED,
            ActivityAction.ADMIN_USER_UPDATED,
            ActivityAction.ADMIN_USER_DELETED,
            ActivityAction.ADMIN_USER_ROLE_CHANGED,
            ActivityAction.ADMIN_USER_SUSPENDED,
            ActivityAction.ADMIN_USER_ACTIVATED,
            ActivityAction.ADMIN_EVENT_CREATED,
            ActivityAction.ADMIN_EVENT_UPDATED,
            ActivityAction.ADMIN_EVENT_DELETED,
            ActivityAction.ADMIN_EVENT_PUBLISHED,
            ActivityAction.ADMIN_EVENT_UNPUBLISHED,
            ActivityAction.ADMIN_MEMBERSHIP_CREATED,
            ActivityAction.ADMIN_MEMBERSHIP_UPDATED,
            ActivityAction.ADMIN_MEMBERSHIP_CANCELLED,
            ActivityAction.ADMIN_PLAN_CREATED,
            ActivityAction.ADMIN_PLAN_UPDATED,
            ActivityAction.ADMIN_PLAN_DELETED,
            ActivityAction.ADMIN_PAYMENT_VERIFIED,
            ActivityAction.ADMIN_PAYMENT_REJECTED,
            ActivityAction.ADMIN_PAYMENT_REFUNDED,
            ActivityAction.ADMIN_ROOM_CREATED,
            ActivityAction.ADMIN_ROOM_UPDATED,
            ActivityAction.ADMIN_ROOM_DELETED,
            ActivityAction.ADMIN_BOOKING_CREATED,
            ActivityAction.ADMIN_BOOKING_CANCELLED,
            ActivityAction.ADMIN_SETTINGS_UPDATED,
            ActivityAction.ADMIN_COUPON_CREATED,
            ActivityAction.ADMIN_COUPON_UPDATED,
            ActivityAction.ADMIN_COUPON_DELETED,
            ActivityAction.ADMIN_CATEGORY_CREATED,
            ActivityAction.ADMIN_CATEGORY_UPDATED,
            ActivityAction.ADMIN_CATEGORY_DELETED,
          ],
        };
      } else if (action === "user") {
        // Non-admin user actions
        where.AND = [
          {
            action: {
              notIn: [
                ActivityAction.ADMIN_USER_CREATED,
                ActivityAction.ADMIN_USER_UPDATED,
                ActivityAction.ADMIN_USER_DELETED,
                ActivityAction.ADMIN_USER_ROLE_CHANGED,
                ActivityAction.ADMIN_USER_SUSPENDED,
                ActivityAction.ADMIN_USER_ACTIVATED,
                ActivityAction.ADMIN_EVENT_CREATED,
                ActivityAction.ADMIN_EVENT_UPDATED,
                ActivityAction.ADMIN_EVENT_DELETED,
                ActivityAction.ADMIN_EVENT_PUBLISHED,
                ActivityAction.ADMIN_EVENT_UNPUBLISHED,
                ActivityAction.ADMIN_MEMBERSHIP_CREATED,
                ActivityAction.ADMIN_MEMBERSHIP_UPDATED,
                ActivityAction.ADMIN_MEMBERSHIP_CANCELLED,
                ActivityAction.ADMIN_PLAN_CREATED,
                ActivityAction.ADMIN_PLAN_UPDATED,
                ActivityAction.ADMIN_PLAN_DELETED,
                ActivityAction.ADMIN_PAYMENT_VERIFIED,
                ActivityAction.ADMIN_PAYMENT_REJECTED,
                ActivityAction.ADMIN_PAYMENT_REFUNDED,
                ActivityAction.ADMIN_ROOM_CREATED,
                ActivityAction.ADMIN_ROOM_UPDATED,
                ActivityAction.ADMIN_ROOM_DELETED,
                ActivityAction.ADMIN_BOOKING_CREATED,
                ActivityAction.ADMIN_BOOKING_CANCELLED,
                ActivityAction.ADMIN_SETTINGS_UPDATED,
                ActivityAction.ADMIN_COUPON_CREATED,
                ActivityAction.ADMIN_COUPON_UPDATED,
                ActivityAction.ADMIN_COUPON_DELETED,
                ActivityAction.ADMIN_CATEGORY_CREATED,
                ActivityAction.ADMIN_CATEGORY_UPDATED,
                ActivityAction.ADMIN_CATEGORY_DELETED,
              ],
            },
          },
          { userId: { not: null } },
        ];
      } else if (action === "payment") {
        where.action = {
          in: [
            ActivityAction.PAYMENT_INITIATED,
            ActivityAction.PAYMENT_COMPLETED,
            ActivityAction.PAYMENT_FAILED,
            ActivityAction.PAYMENT_REFUNDED,
            ActivityAction.PAYMENT_VERIFIED,
            ActivityAction.ADMIN_PAYMENT_VERIFIED,
            ActivityAction.ADMIN_PAYMENT_REJECTED,
            ActivityAction.ADMIN_PAYMENT_REFUNDED,
          ],
        };
      } else if (action === "event") {
        where.action = {
          in: [
            ActivityAction.EVENT_REGISTRATION,
            ActivityAction.EVENT_CANCELLATION,
            ActivityAction.EVENT_ATTENDANCE,
            ActivityAction.ADMIN_EVENT_CREATED,
            ActivityAction.ADMIN_EVENT_UPDATED,
            ActivityAction.ADMIN_EVENT_DELETED,
            ActivityAction.ADMIN_EVENT_PUBLISHED,
            ActivityAction.ADMIN_EVENT_UNPUBLISHED,
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
            ActivityAction.ADMIN_BOOKING_CREATED,
            ActivityAction.ADMIN_BOOKING_CANCELLED,
          ],
        };
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
    console.error("Failed to fetch activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
