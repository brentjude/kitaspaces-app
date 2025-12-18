import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { id: bookingId } = await context.params;

    // Try to find user booking first
    const userBooking = await prisma.meetingRoomBooking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        user: {
          select: {
            name: true,
            email: true,
            contactNumber: true,
            isMember: true,
          },
        },
      },
    });

    if (userBooking) {
      // Parse amenities from JSON string to array
      let amenities: string[] = [];
      try {
        amenities = userBooking.room.amenities
          ? JSON.parse(userBooking.room.amenities as string)
          : [];
      } catch (e) {
        console.error("Error parsing amenities:", e);
        amenities = [];
      }

      return NextResponse.json({
        success: true,
        data: {
          id: userBooking.id,
          bookingDate: userBooking.bookingDate,
          startTime: userBooking.startTime,
          endTime: userBooking.endTime,
          numberOfAttendees: userBooking.numberOfAttendees,
          purpose: userBooking.purpose,
          status: userBooking.status,
          createdAt: userBooking.createdAt,
          room: {
            name: userBooking.room.name,
            capacity: userBooking.room.capacity,
            location: userBooking.room.roomNumber || null, // Use roomNumber as location fallback
            amenities,
          },
          user: {
            name: userBooking.user.name,
            email: userBooking.user.email,
            contactNumber: userBooking.user.contactNumber,
            isMember: userBooking.user.isMember,
          },
          bookingType: "user",
        },
      });
    }

    // If not found, try customer booking
    const customerBooking = await prisma.customerMeetingRoomBooking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        customer: {
          select: {
            name: true,
            email: true,
            contactNumber: true,
          },
        },
      },
    });

    if (customerBooking) {
      // Parse amenities from JSON string to array
      let amenities: string[] = [];
      try {
        amenities = customerBooking.room.amenities
          ? JSON.parse(customerBooking.room.amenities as string)
          : [];
      } catch (e) {
        console.error("Error parsing amenities:", e);
        amenities = [];
      }

      return NextResponse.json({
        success: true,
        data: {
          id: customerBooking.id,
          bookingDate: customerBooking.bookingDate,
          startTime: customerBooking.startTime,
          endTime: customerBooking.endTime,
          numberOfAttendees: customerBooking.numberOfAttendees,
          purpose: customerBooking.purpose,
          status: customerBooking.status,
          createdAt: customerBooking.createdAt,
          room: {
            name: customerBooking.room.name,
            capacity: customerBooking.room.capacity,
            location: customerBooking.room.roomNumber || null, // Use roomNumber as location fallback
            amenities,
          },
          customer: {
            name: customerBooking.customer.name,
            email: customerBooking.customer.email,
            contactNumber: customerBooking.customer.contactNumber,
          },
          bookingType: "customer",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Booking not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch booking details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
