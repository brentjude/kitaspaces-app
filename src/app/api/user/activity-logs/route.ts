import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

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
        where.action = { contains: "PAYMENT" };
      } else if (action === "event") {
        where.action = { contains: "EVENT" };
      } else if (action === "booking") {
        where.action = { contains: "BOOKING" };
      } else if (action === "membership") {
        where.action = { contains: "MEMBERSHIP" };
      } else if (action === "profile") {
        where.OR = [
          { action: "PROFILE_UPDATE" },
          { action: "EMAIL_CHANGE" },
          { action: "PASSWORD_CHANGE" },
        ];
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
