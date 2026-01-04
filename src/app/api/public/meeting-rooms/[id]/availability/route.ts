import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/meeting-rooms/[id]/availability - Check room availability
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const bookingDate = new Date(date);

    // ✅ Fetch the room to get operating hours
    const room = await prisma.meetingRoom.findUnique({
      where: { id },
      select: {
        startTime: true,
        endTime: true,
        isActive: true,
      },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { success: false, error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    // Fetch all confirmed/pending bookings from BOTH tables for this room on the given date
    const [userBookings, customerBookings] = await Promise.all([
      prisma.meetingRoomBooking.findMany({
        where: {
          roomId: id,
          bookingDate: bookingDate,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
      prisma.customerMeetingRoomBooking.findMany({
        where: {
          roomId: id,
          bookingDate: bookingDate,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
    ]);

    // Combine all booked slots from both tables
    const bookedSlots = [
      ...userBookings.map((booking) => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
      ...customerBookings.map((booking) => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
    ];

    // ✅ Generate time slots based on room operating hours
    const generateTimeSlots = (
      startTime: string,
      endTime: string,
      bookedSlots: { startTime: string; endTime: string }[]
    ) => {
      const slots: { time: string; isAvailable: boolean }[] = [];

      // Parse start and end times
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Generate slots in 30-minute intervals
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

        // Check if this time slot conflicts with any booking
        const isBooked = bookedSlots.some((slot) => {
          const slotStart = slot.startTime;
          const slotEnd = slot.endTime;

          // A slot is booked if the time falls within any booked range
          return timeStr >= slotStart && timeStr < slotEnd;
        });

        slots.push({
          time: timeStr,
          isAvailable: !isBooked,
        });
      }

      return slots;
    };

    const timeSlots = generateTimeSlots(
      room.startTime || "09:00",
      room.endTime || "18:00",
      bookedSlots
    );

    return NextResponse.json({
      success: true,
      data: {
        date,
        bookedSlots,
        timeSlots, // ✅ Added timeSlots array
      },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
