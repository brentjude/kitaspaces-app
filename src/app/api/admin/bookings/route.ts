import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch user bookings
    const userBookings = await prisma.meetingRoomBooking.findMany({
      include: {
        room: true,
        user: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Fetch customer bookings
    const customerBookings = await prisma.customerMeetingRoomBooking.findMany({
      include: {
        room: true,
        customer: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Combine and tag bookings
    const combinedBookings = [
      ...userBookings.map((booking) => ({
        ...booking,
        type: "user" as const,
      })),
      ...customerBookings.map((booking) => ({
        ...booking,
        type: "customer" as const,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      data: combinedBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}