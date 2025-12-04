import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/events
 * Get all events (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                isMember: true,
              },
            },
            payment: true,
          },
        },
        freebies: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new event (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      price,
      isFree,
      isMemberOnly,
      isFreeForMembers,
      isRedemptionEvent,
      redemptionLimit,
      maxAttendees,
      imageUrl,
      freebies, // Array of freebie objects
    } = body;

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, description, and date are required",
        },
        { status: 400 }
      );
    }

    // Create event with freebies in a transaction
    const event = await prisma.$transaction(async (tx) => {
      // Create the event
      const newEvent = await tx.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          startTime: startTime || null,
          endTime: endTime || null,
          location: location || null,
          price: price || 0,
          isFree: isFree ?? true,
          isMemberOnly: isMemberOnly ?? false,
          isFreeForMembers: isFreeForMembers ?? false,
          isRedemptionEvent: isRedemptionEvent ?? false,
          redemptionLimit: isRedemptionEvent ? redemptionLimit || 1 : null,
          maxAttendees: maxAttendees || null,
          imageUrl: imageUrl || null,
        },
      });

      // Create freebies if provided
      if (freebies && Array.isArray(freebies) && freebies.length > 0) {
        const freebieData = freebies.map(
          (freebie: {
            name: string;
            description?: string;
            quantity: number;
          }) => ({
            eventId: newEvent.id,
            name: freebie.name,
            description: freebie.description || null,
            quantity: freebie.quantity || 1,
          })
        );

        await tx.eventFreebie.createMany({
          data: freebieData,
        });
      }

      // Fetch the complete event with freebies
      const eventWithFreebies = await tx.event.findUnique({
        where: { id: newEvent.id },
        include: {
          freebies: true,
          registrations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  isMember: true,
                },
              },
              payment: true,
            },
          },
        },
      });

      return eventWithFreebies;
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
