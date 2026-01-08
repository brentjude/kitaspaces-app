import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: roomId } = await params;

    if (!roomId) {
      console.error("Availability API: No roomId provided");
      return NextResponse.json(
        { success: false, error: "Room ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const excludeId = searchParams.get("excludeId");
    const excludeType = searchParams.get("type");

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Date is required" },
        { status: 400 }
      );
    }

    const room = await prisma.meetingRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      console.error("Room not found:", roomId);
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    const bookingDate = new Date(date);
    const shouldExclude = excludeId && excludeType;

    // ✅ Build where clauses with proper Prisma types
    const userBookingWhere = {
      roomId,
      bookingDate,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      ...(shouldExclude &&
        excludeType === "MEMBER" && { id: { not: excludeId } }),
    };

    const customerBookingWhere = {
      roomId,
      bookingDate,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      ...(shouldExclude &&
        excludeType === "CUSTOMER" && { id: { not: excludeId } }),
    };

    const [userBookings, customerBookings] = await Promise.all([
      prisma.meetingRoomBooking.findMany({
        where: userBookingWhere,
        select: { startTime: true, endTime: true },
      }),
      prisma.customerMeetingRoomBooking.findMany({
        where: customerBookingWhere,
        select: { startTime: true, endTime: true },
      }),
    ]);

    const bookedSlots = [
      ...userBookings.map((b) => ({ start: b.startTime, end: b.endTime })),
      ...customerBookings.map((b) => ({ start: b.startTime, end: b.endTime })),
    ];

    const startTime = room.startTime || "09:00";
    const endTime = room.endTime || "18:00";

    const [startHour] = startTime.split(":").map(Number);
    const [endHour] = endTime.split(":").map(Number);

    const slots: { time: string; available: boolean }[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

        const isBooked = bookedSlots.some(
          (slot) => timeSlot >= slot.start && timeSlot < slot.end
        );

        slots.push({
          time: timeSlot,
          available: !isBooked,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        timeSlots: slots,
        roomDetails: {
          name: room.name,
          capacity: room.capacity,
          hourlyRate: room.hourlyRate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch availability",
      },
      { status: 500 }
    );
  }
}
