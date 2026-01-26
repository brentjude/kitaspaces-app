import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const showPastEvents = searchParams.get("showPastEvents") === "true";

    const where: Prisma.EventWhereInput = {
      AND: [
        // Only show upcoming events by default
        ...(!showPastEvents ? [{
          date: {
            gte: new Date(), // Greater than or equal to today
          },
        }] : []),
      ],
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
        { location: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    // Add category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        freebies: true,
        registrations: {
          select: { id: true },
        },
        customerRegistrations: {
          select: { id: true },
        },
      },
      orderBy: { date: "asc" },
    });

    const eventsWithCount = events.map((event) => ({
      ...event,
      registrationCount:
        event.registrations.length + event.customerRegistrations.length,
    }));

    return NextResponse.json({ success: true, data: eventsWithCount });
  } catch (error) {
    console.error("Error fetching public events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}