import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString()
    );
    const viewMode = searchParams.get("viewMode") || "month";

    // Filters
    const showFreeOnly = searchParams.get("showFreeOnly") === "true";
    const showMemberOnly = searchParams.get("showMemberOnly") === "true";
    const showRedemptionOnly =
      searchParams.get("showRedemptionOnly") === "true";
    const showEventsOnly = searchParams.get("showEventsOnly") === "true";
    const showBookingsOnly = searchParams.get("showBookingsOnly") === "true";
    const categoryId = searchParams.get("categoryId") || undefined;

    // Calculate date range based on view mode
    let startDate: Date;
    let endDate: Date;

    if (viewMode === "day") {
      const day = parseInt(searchParams.get("day") || "1");
      startDate = new Date(year, month - 1, day, 0, 0, 0);
      endDate = new Date(year, month - 1, day, 23, 59, 59);
    } else if (viewMode === "week") {
      const week = parseInt(searchParams.get("week") || "1");
      startDate = new Date(year, month - 1, (week - 1) * 7 + 1);
      endDate = new Date(year, month - 1, week * 7, 23, 59, 59);
    } else {
      // Month view
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    }

    // Fetch events if not filtering for bookings only
    const events = !showBookingsOnly
      ? await prisma.event.findMany({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            ...(showFreeOnly && { isFree: true }),
            ...(showMemberOnly && { isMemberOnly: true }),
            ...(showRedemptionOnly && { isRedemptionEvent: true }),
            ...(categoryId && { categoryId }),
          },
          include: {
            category: true,
            registrations: {
              select: { id: true },
            },
            customerRegistrations: {
              select: { id: true },
            },
          },
          orderBy: {
            date: "asc",
          },
        })
      : [];

    // Fetch meeting room bookings if not filtering for events only
    const bookings = !showEventsOnly
      ? await Promise.all([
          // User bookings
          prisma.meetingRoomBooking.findMany({
            where: {
              bookingDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              room: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              bookingDate: "asc",
            },
          }),
          // Customer bookings
          prisma.customerMeetingRoomBooking.findMany({
            where: {
              bookingDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              room: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              bookingDate: "asc",
            },
          }),
        ]).then(([userBookings, customerBookings]) => [
          ...userBookings.map((b) => ({
            ...b,
            userName: b.user.name,
            userEmail: b.user.email,
            roomName: b.room.name,
            type: "user" as const,
          })),
          ...customerBookings.map((b) => ({
            ...b,
            userName: b.customer.name,
            userEmail: b.customer.email,
            roomName: b.room.name,
            type: "customer" as const,
          })),
        ])
      : [];

    // Transform events for calendar
    const calendarEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      isFree: event.isFree,
      isMemberOnly: event.isMemberOnly,
      isRedemptionEvent: event.isRedemptionEvent,
      categoryId: event.categoryId,
      categoryName: event.category?.name,
      categoryColor: event.category?.color,
      registrationCount:
        event.registrations.length + event.customerRegistrations.length,
      maxAttendees: event.maxAttendees,
      type: "event" as const,
    }));

    // Transform bookings for calendar
    const calendarBookings = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.roomName} - ${booking.userName}`,
      date: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.roomName,
      roomName: booking.roomName,
      userName: booking.userName,
      userEmail: booking.userEmail,
      status: booking.status,
      numberOfAttendees: booking.numberOfAttendees,
      type: "booking" as const,
      bookingType: booking.type,
    }));

    return NextResponse.json({
      success: true,
      data: {
        events: calendarEvents,
        bookings: calendarBookings,
        stats: {
          totalEvents: calendarEvents.length,
          totalBookings: calendarBookings.length,
          freeEvents: calendarEvents.filter((e) => e.isFree).length,
          paidEvents: calendarEvents.filter((e) => !e.isFree).length,
          totalRegistrations: calendarEvents.reduce(
            (sum, e) => sum + e.registrationCount,
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch calendar data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
