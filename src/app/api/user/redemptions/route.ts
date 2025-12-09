import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch redemption events
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch redemption events (show events for today and future)
    const redemptionEvents = await prisma.event.findMany({
      where: {
        isRedemptionEvent: true,
        date: {
          gte: today,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Fetch user's redemptions
    const userRedemptions = await prisma.dailyUseRedemption.findMany({
      where: {
        userId,
      },
      select: {
        eventId: true,
        redeemedAt: true,
      },
    });

    const redemptionMap = new Map(
      userRedemptions.map((r) => [r.eventId, r.redeemedAt])
    );

    // Get current date for checking if redemption is available
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return NextResponse.json({
      success: true,
      data: redemptionEvents.map((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        // Check if event date matches today
        const isToday = eventDate.getTime() === currentDate.getTime();
        
        return {
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          redemptionLimit: event.redemptionLimit,
          category: event.category,
          isRedeemed: redemptionMap.has(event.id),
          redeemedAt: redemptionMap.get(event.id) || null,
          canRedeem: isToday, // Only true if event is today
        };
      }),
    });
  } catch (error) {
    console.error('Redemptions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load redemptions' },
      { status: 500 }
    );
  }
}

// POST - Redeem an event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists and is a redemption event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isRedemptionEvent) {
      return NextResponse.json(
        { error: 'This event is not a redemption event' },
        { status: 400 }
      );
    }

    // Check if event date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() !== today.getTime()) {
      if (eventDate.getTime() < today.getTime()) {
        return NextResponse.json(
          { error: 'This redemption has expired. You can only redeem on the event date.' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'This redemption is not yet available. Please come back on the event date.' },
          { status: 400 }
        );
      }
    }

    // Check if already redeemed
    const existingRedemption = await prisma.dailyUseRedemption.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (existingRedemption) {
      return NextResponse.json(
        { error: 'You have already redeemed this event' },
        { status: 400 }
      );
    }

    // Check redemption limit
    if (event.redemptionLimit) {
      const userRedemptionCount = await prisma.dailyUseRedemption.count({
        where: {
          userId,
          eventId,
        },
      });

      if (userRedemptionCount >= event.redemptionLimit) {
        return NextResponse.json(
          { error: 'Redemption limit reached' },
          { status: 400 }
        );
      }
    }

    // Create redemption
    const redemption = await prisma.dailyUseRedemption.create({
      data: {
        userId,
        eventId,
        notes: `Redeemed: ${event.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        redemptionId: redemption.id,
        redeemedAt: redemption.redeemedAt,
        message: 'Event redeemed successfully!',
      },
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to redeem event' },
      { status: 500 }
    );
  }
}