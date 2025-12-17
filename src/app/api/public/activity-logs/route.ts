import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find customer by email
    const customer = await prisma.customer.findFirst({
      where: { email },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "No records found for this email" },
        { status: 404 }
      );
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          customerId: customer.id,
        },
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
      prisma.activityLog.count({
        where: { customerId: customer.id },
      }),
    ]);

    return NextResponse.json({
      logs,
      customer: {
        name: customer.name,
        email: customer.email,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch customer activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
