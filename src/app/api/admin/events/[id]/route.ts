import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEventSlug } from '@/lib/utils/slug';

// Type definition for update request body
interface UpdateEventBody {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  price?: number;
  isFree?: boolean;
  isMemberOnly?: boolean;
  isFreeForMembers?: boolean;
  categoryId?: string | null;
  isRedemptionEvent?: boolean;
  redemptionLimit?: number | null;
  maxAttendees?: number | null;
  imageUrl?: string | null;
}

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

    const { id: eventId } = await context.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        category: true,
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
 * Updates an event (regenerates slug if title changes)
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

    const { id: eventId } = await context.params;
    const body = await request.json() as UpdateEventBody;

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

    // Build update data object with proper typing
    interface EventUpdateData {
      title?: string;
      slug?: string;
      description?: string;
      date?: Date;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      price?: number;
      isFree?: boolean;
      isMemberOnly?: boolean;
      isFreeForMembers?: boolean;
      categoryId?: string | null;
      isRedemptionEvent?: boolean;
      redemptionLimit?: number | null;
      maxAttendees?: number | null;
      imageUrl?: string | null;
    }

    const updateData: EventUpdateData = {};
    
    if (body.title !== undefined) {
      updateData.title = body.title;
      // Regenerate slug if title changes
      updateData.slug = generateEventSlug(body.title, eventId);
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.date !== undefined) {
      updateData.date = new Date(body.date);
    }
    if (body.startTime !== undefined) {
      updateData.startTime = body.startTime;
    }
    if (body.endTime !== undefined) {
      updateData.endTime = body.endTime;
    }
    if (body.location !== undefined) {
      updateData.location = body.location;
    }
    if (body.price !== undefined) {
      updateData.price = body.price;
    }
    if (body.isFree !== undefined) {
      updateData.isFree = body.isFree;
    }
    if (body.isMemberOnly !== undefined) {
      updateData.isMemberOnly = body.isMemberOnly;
    }
    if (body.isFreeForMembers !== undefined) {
      updateData.isFreeForMembers = body.isFreeForMembers;
    }
    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId;
    }
    if (body.isRedemptionEvent !== undefined) {
      updateData.isRedemptionEvent = body.isRedemptionEvent;
    }
    if (body.redemptionLimit !== undefined) {
      updateData.redemptionLimit = body.redemptionLimit;
    }
    if (body.maxAttendees !== undefined) {
      updateData.maxAttendees = body.maxAttendees;
    }
    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl;
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        category: true,
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

    const { id: eventId } = await context.params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            pax: true,
          },
        },
        customerRegistrations: true,
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

    // 2. Delete customer pax freebies
    await prisma.customerPaxFreebie.deleteMany({
      where: {
        pax: {
          registration: {
            eventId: eventId,
          },
        },
      },
    });

    // 3. Delete event pax
    await prisma.eventPax.deleteMany({
      where: {
        registration: {
          eventId: eventId,
        },
      },
    });

    // 4. Delete customer event pax
    await prisma.customerEventPax.deleteMany({
      where: {
        registration: {
          eventId: eventId,
        },
      },
    });

    // 5. Delete daily use redemptions
    await prisma.dailyUseRedemption.deleteMany({
      where: { eventId: eventId },
    });

    // 6. Delete customer daily use redemptions
    await prisma.customerDailyUseRedemption.deleteMany({
      where: { eventId: eventId },
    });

    // 7. Delete event registrations
    await prisma.eventRegistration.deleteMany({
      where: { eventId: eventId },
    });

    // 8. Delete customer event registrations
    await prisma.customerEventRegistration.deleteMany({
      where: { eventId: eventId },
    });

    // 9. Delete event freebies
    await prisma.eventFreebie.deleteMany({
      where: { eventId: eventId },
    });

    // 10. Finally delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: 'Event and all related data deleted successfully',
      data: {
        registrationsDeleted: existingEvent.registrations.length,
        customerRegistrationsDeleted: existingEvent.customerRegistrations.length,
        paxDeleted: existingEvent.registrations.reduce((sum, reg) => sum + reg.pax.length, 0),
        freebiesDeleted: existingEvent.freebies.length,
      },
    });
  } catch (error) {
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