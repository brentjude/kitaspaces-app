import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerActivity } from "@/types/customer-detail";

function getActionLabel(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getActivityStatus(
  action: string,
  isSuccess: boolean
): "completed" | "pending" | "failed" {
  if (!isSuccess) return "failed";
  if (action.includes("PENDING") || action.includes("INITIATED"))
    return "pending";
  return "completed";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Check if this is a user or customer
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    const whereClause = user ? { userId: id } : { customerId: id };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    const activities: CustomerActivity[] = logs.map((log) => ({
      id: log.id,
      action: log.action,
      actionLabel: getActionLabel(log.action),
      description: log.description,
      date: log.createdAt,
      status: getActivityStatus(log.action, log.isSuccess),
      referenceId: log.referenceId,
      referenceType: log.referenceType,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch customer activities:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
