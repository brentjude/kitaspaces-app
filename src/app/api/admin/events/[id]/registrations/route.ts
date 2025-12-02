import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/events/[id]/registrations
 * Add a new registrant to an event
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const eventId = params.id;
    const body = await request.json();
    const { userId, numberOfPax = 1 } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'User already registered for this event' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId,
        eventId,
        numberOfPax,
        attendeeName: user.name,
        attendeeEmail: user.email,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isMember: true,
          },
        },
      },
    });

    // Create payment record if event is not free
    if (!event.isFree && event.price > 0) {
      await prisma.payment.create({
        data: {
          userId,
          amount: event.price,
          paymentMethod: 'OTHER',
          status: 'PENDING',
          eventRegistration: {
            connect: { id: registration.id },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error adding registrant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add registrant',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}