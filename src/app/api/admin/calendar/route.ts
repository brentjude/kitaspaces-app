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

    // Filters
    const showFreeOnly = searchParams.get("showFreeOnly") === "true";
    const showMemberOnly = searchParams.get("showMemberOnly") === "true";
    const showRedemptionOnly =
      searchParams.get("showRedemptionOnly") === "true";
    const showEventsOnly = searchParams.get("showEventsOnly") === "true";
    const showBookingsOnly = searchParams.get("showBookingsOnly") === "true";
    const categoryId = searchParams.get("categoryId") || undefined;

    // Load all data from 3 months ago to 12 months in the future
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 3);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 12);
    endDate.setHours(23, 59, 59, 999);

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
              include: {
                pax: true,
              },
            },
            customerRegistrations: {
              include: {
                pax: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        })
      : [];

    // Fetch meeting room bookings if not filtering for events only
    const userBookings = !showEventsOnly
      ? await prisma.meetingRoomBooking.findMany({
          where: {
            bookingDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            room: true,
            user: true,
            payment: true,
          },
          orderBy: {
            bookingDate: "asc",
          },
        })
      : [];

    const customerBookings = !showEventsOnly
      ? await prisma.customerMeetingRoomBooking.findMany({
          where: {
            bookingDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            room: true,
            customer: true,
            payment: true,
          },
          orderBy: {
            bookingDate: "asc",
          },
        })
      : [];

    // Transform events for calendar
    const calendarEvents = events.map((event) => {
      // Calculate total attendees including pax
      const memberRegistrations = event.registrations?.length || 0;
      const memberPax =
        event.registrations?.reduce(
          (sum, reg) => sum + (reg.pax?.length || 0),
          0
        ) || 0;
      const customerRegistrations = event.customerRegistrations?.length || 0;
      const customerPax =
        event.customerRegistrations?.reduce(
          (sum, reg) => sum + (reg.pax?.length || 0),
          0
        ) || 0;

      const totalRegistrations =
        memberRegistrations + memberPax + customerRegistrations + customerPax;

      return {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        isFree: event.isFree,
        isMemberOnly: event.isMemberOnly,
        isRedemptionEvent: event.isRedemptionEvent,
        categoryId: event.categoryId,
        categoryName: event.category?.name,
        categoryColor: event.category?.color,
        registrationCount: totalRegistrations,
        maxAttendees: event.maxAttendees,
        type: "event" as const,
      };
    });

    // Transform user bookings for calendar
    const transformedUserBookings = userBookings.map((booking) => ({
      id: booking.id,
      title: `${booking.room.name} - ${booking.user.name}`,
      date: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.room.name,
      roomName: booking.room.name,
      userName: booking.user.name,
      userEmail: booking.user.email,
      status: booking.status,
      numberOfAttendees: booking.numberOfAttendees,
      type: "booking" as const,
      bookingType: "user" as const,
      duration: booking.duration,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        capacity: booking.room.capacity,
        hourlyRate: booking.room.hourlyRate,
        floor: booking.room.floor,
        roomNumber: booking.room.roomNumber,
        amenities: booking.room.amenities,
      },
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      contactMobile: booking.contactMobile,
      company: booking.company,
      designation: booking.designation,
      purpose: booking.purpose,
      totalAmount: booking.totalAmount,
      paymentReference: booking.payment?.paymentReference || null,
      paymentMethod: booking.payment?.paymentMethod || null,
    }));

    // Transform customer bookings for calendar
    const transformedCustomerBookings = customerBookings.map((booking) => ({
      id: booking.id,
      title: `${booking.room.name} - ${booking.customer.name}`,
      date: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.room.name,
      roomName: booking.room.name,
      userName: booking.customer.name,
      userEmail: booking.customer.email || "",
      status: booking.status,
      numberOfAttendees: booking.numberOfAttendees,
      type: "booking" as const,
      bookingType: "customer" as const,
      duration: booking.duration,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        capacity: booking.room.capacity,
        hourlyRate: booking.room.hourlyRate,
        floor: booking.room.floor,
        roomNumber: booking.room.roomNumber,
        amenities: booking.room.amenities,
      },
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      contactMobile: booking.contactMobile || booking.contactPhone || null,
      company: booking.company,
      designation: booking.designation,
      purpose: booking.purpose,
      totalAmount: booking.totalAmount,
      paymentReference: booking.payment?.paymentReference || null,
      paymentMethod: booking.payment?.paymentMethod || null,
    }));

    // Combine all bookings
    const calendarBookings = [
      ...transformedUserBookings,
      ...transformedCustomerBookings,
    ];

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
    console.error("❌ Calendar fetch error:", error);
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
