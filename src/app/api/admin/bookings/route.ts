import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user bookings with FULL room data
    const userBookings = await prisma.meetingRoomBooking.findMany({
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    // Fetch customer bookings with FULL room data
    const customerBookings = await prisma.customerMeetingRoomBooking.findMany({
      include: {
        room: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    const combinedBookings = [
      ...userBookings.map((b) => ({ ...b, type: "user" as const })),
      ...customerBookings.map((b) => ({ ...b, type: "customer" as const })),
    ].sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: combinedBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}
