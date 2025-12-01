import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { EventWithRelations } from '@/types';

/**
 * GET /api/admin/events
 * Fetches all events with their relations (registrations, freebies)
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering and sorting
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'upcoming' | 'completed' | 'all'
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Record<string, unknown> = {};

    // Filter by status (upcoming/completed)
    if (status && status !== 'all') {
      const now = new Date();
      if (status === 'upcoming') {
        where.date = { gte: now };
      } else if (status === 'completed') {
        where.date = { lt: now };
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch events with relations
    const events: EventWithRelations[] = await prisma.event.findMany({
      where,
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
            pax: true,
          },
        },
        freebies: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Calculate statistics
    const now = new Date();
    const stats = {
      total: events.length,
      upcoming: events.filter((e) => new Date(e.date) > now).length,
      completed: events.filter((e) => new Date(e.date) <= now).length,
      totalAttendees: events.reduce(
        (sum, event) => sum + (event.registrations?.length || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: events,
      stats,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
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

/**
 * POST /api/admin/events
 * Creates a new event
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        location: body.location,
        price: body.price || 0,
        isFree: body.isFree || false,
        isMemberOnly: body.isMemberOnly || false,
        isFreeForMembers: body.isFreeForMembers || false,
        isRedemptionEvent: body.isRedemptionEvent || false,
        redemptionLimit: body.redemptionLimit,
        maxAttendees: body.maxAttendees,
        imageUrl: body.imageUrl,
      },
      include: {
        registrations: true,
        freebies: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
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