import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = params.id;
    const body = await request.json();
    const { freebieSelections } = body;

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        freebies: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isRedemptionEvent) {
      return NextResponse.json(
        { error: 'This is not a redemption event' },
        { status: 400 }
      );
    }

    // Check redemption limit
    if (event.redemptionLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayRedemptions = await prisma.eventRegistration.count({
        where: {
          eventId: event.id,
          userId: session.user.id,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: 'CONFIRMED',
        },
      });

      if (todayRedemptions >= event.redemptionLimit) {
        return NextResponse.json(
          { error: `You have reached the daily redemption limit of ${event.redemptionLimit}` },
          { status: 400 }
        );
      }
    }

    // Create redemption record
    const redemption = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        status: 'CONFIRMED',
        amountPaid: 0,
        freebieSelections: {
          create: freebieSelections.map((selection: {
            freebieId: string;
            selectedOption: string;
          }) => ({
            freebieId: selection.freebieId,
            selectedOption: selection.selectedOption,
          })),
        },
      },
      include: {
        freebieSelections: {
          include: {
            freebie: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        redemption,
        message: 'Redemption successful!',
      },
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to process redemption' },
      { status: 500 }
    );
  }
}