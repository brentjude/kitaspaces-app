import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

/**
 * GET /api/admin/calendar
 * 
 * @description Get events for calendar view with optional filters
 * @query year - Year to fetch events for (default: current year)
 * @query month - Month to fetch events for (1-12, default: current month)
 * @query showFreeOnly - Filter to show only free events (boolean)
 * @query showMemberOnly - Filter to show only member-exclusive events (boolean)
 * @query showRedemptionOnly - Filter to show only daily use/redemption events (boolean)
 * 
 * @returns {
 *   success: boolean;
 *   data: {
 *     year: number;
 *     month: number;
 *     events: CalendarEvent[];
 *   }
 * }
 * 
 * @example
 * GET /api/admin/calendar?year=2025&month=1&showFreeOnly=true
 * 
 * @note This endpoint requires ADMIN authentication
 * @note Events include combined registration counts from both users and customers
 * @note Date range covers the entire month (1st to last day)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const showFreeOnly = searchParams.get('showFreeOnly') === 'true';
    const showMemberOnly = searchParams.get('showMemberOnly') === 'true';
    const showRedemptionOnly = searchParams.get('showRedemptionOnly') === 'true';

    // Validate year and month
    if (year < 2000 || year > 2100) {
      return NextResponse.json(
        { success: false, error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Invalid month parameter (must be 1-12)' },
        { status: 400 }
      );
    }

    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Build type-safe filters using Prisma.EventWhereInput
    const filters: Prisma.EventWhereInput = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (showFreeOnly) {
      filters.isFree = true;
    }

    if (showMemberOnly) {
      filters.isMemberOnly = true;
    }

    if (showRedemptionOnly) {
      filters.isRedemptionEvent = true;
    }

    // Fetch events with registration counts using type-safe select
    const events = await prisma.event.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        location: true,
        isFree: true,
        isMemberOnly: true,
        isRedemptionEvent: true,
        maxAttendees: true,
        _count: {
          select: {
            registrations: true,
            customerRegistrations: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform events to include total registration count
    // Using explicit type for transformed data
    type CalendarEventResponse = {
      id: string;
      title: string;
      date: Date;
      startTime: string | null;
      endTime: string | null;
      location: string | null;
      isFree: boolean;
      isMemberOnly: boolean;
      isRedemptionEvent: boolean;
      maxAttendees: number | null;
      registrationCount: number;
    };

    const calendarEvents: CalendarEventResponse[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      isFree: event.isFree,
      isMemberOnly: event.isMemberOnly,
      isRedemptionEvent: event.isRedemptionEvent,
      maxAttendees: event.maxAttendees,
      registrationCount: event._count.registrations + event._count.customerRegistrations,
    }));

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        events: calendarEvents,
      },
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}