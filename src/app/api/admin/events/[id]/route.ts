import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/events/[id]
 * Fetches a single event by ID with all relations
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    // Await params in Next.js 15
    const params = await context.params;
    const eventId = params.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
            payment: true,
          },
        },
        freebies: {
          include: {
            paxFreebies: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
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
 * PATCH /api/admin/events/[id]
 * Updates an event
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    // Await params in Next.js 15
    const params = await context.params;
    const eventId = params.id;

    const body = await request.json();

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.isFree !== undefined && { isFree: body.isFree }),
        ...(body.isMemberOnly !== undefined && { isMemberOnly: body.isMemberOnly }),
        ...(body.isFreeForMembers !== undefined && { isFreeForMembers: body.isFreeForMembers }),
        ...(body.isRedemptionEvent !== undefined && { isRedemptionEvent: body.isRedemptionEvent }),
        ...(body.redemptionLimit !== undefined && { redemptionLimit: body.redemptionLimit }),
        ...(body.maxAttendees !== undefined && { maxAttendees: body.maxAttendees }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      },
      include: {
        registrations: true,
        freebies: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Error updating event:', error);
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
 * DELETE /api/admin/events/[id]
 * Deletes an event and all related data
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    // Await params in Next.js 15
    const params = await context.params;
    const eventId = params.id;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            pax: true,
          },
        },
        freebies: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete in correct order due to foreign key constraints
    
    // 1. Delete pax freebies
    await prisma.paxFreebie.deleteMany({
      where: {
        pax: {
          registration: {
            eventId: eventId,
          },
        },
      },
    });

    // 2. Delete event pax
    await prisma.eventPax.deleteMany({
      where: {
        registration: {
          eventId: eventId,
        },
      },
    });

    // 3. Delete daily use redemptions
    await prisma.dailyUseRedemption.deleteMany({
      where: { eventId: eventId },
    });

    // 4. Delete event registrations
    await prisma.eventRegistration.deleteMany({
      where: { eventId: eventId },
    });

    // 5. Delete event freebies
    await prisma.eventFreebie.deleteMany({
      where: { eventId: eventId },
    });

    // 6. Finally delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: 'Event and all related data deleted successfully',
      data: {
        registrationsDeleted: existingEvent.registrations.length,
        paxDeleted: existingEvent.registrations.reduce((sum, reg) => sum + reg.pax.length, 0),
        freebiesDeleted: existingEvent.freebies.length,
      },
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}