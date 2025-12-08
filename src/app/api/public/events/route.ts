import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date(), // Only future events
        },
      },
      include: {
        freebies: true,
        registrations: {
          select: {
            id: true,
          },
        },
        customerRegistrations: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Transform to include registration count
    const eventsWithStats = events.map((event) => ({
      ...event,
      registrationCount:
        event.registrations.length + event.customerRegistrations.length,
    }));

    return NextResponse.json({
      success: true,
      data: eventsWithStats,
    });
  } catch (error) {
    console.error("Error fetching public events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
