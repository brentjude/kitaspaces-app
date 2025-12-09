import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEventSlug } from '@/lib/utils/slug';

// Type definitions for request body
interface FreebieInput {
  name: string;
  description?: string | null;
  quantity: number;
  imageUrl?: string | null;
}

interface CreateEventBody {
  title: string;
  description: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  price: number | string;
  isFree?: boolean;
  isMemberOnly?: boolean;
  isFreeForMembers?: boolean;
  categoryId?: string | null;
  isRedemptionEvent?: boolean;
  redemptionLimit?: number | string | null;
  maxAttendees?: number | string | null;
  imageUrl?: string | null;
  freebies?: FreebieInput[];
}

/**
 * POST /api/admin/events
 * Creates a new event with auto-generated slug
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as CreateEventBody;

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      price,
      isFree,
      isMemberOnly,
      isFreeForMembers,
      categoryId,
      isRedemptionEvent,
      redemptionLimit,
      maxAttendees,
      imageUrl,
      freebies = [],
    } = body;

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'Title, description, and date are required' 
        },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (categoryId) {
      const categoryExists = await prisma.eventCategory.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid category',
            details: `Category with ID ${categoryId} not found` 
          },
          { status: 400 }
        );
      }
    }

    // Parse date
    let eventDate: Date;
    try {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (_error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid date',
          details: 'Please provide a valid date in ISO format' 
        },
        { status: 400 }
      );
    }

    // Parse numeric values
    const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
    const parsedRedemptionLimit = redemptionLimit 
      ? (typeof redemptionLimit === 'string' ? parseInt(redemptionLimit, 10) : redemptionLimit)
      : null;
    const parsedMaxAttendees = maxAttendees
      ? (typeof maxAttendees === 'string' ? parseInt(maxAttendees, 10) : maxAttendees)
      : null;

    // Create event first without slug
    const event = await prisma.event.create({
      data: {
        title,
        slug: '', // Temporary slug
        description,
        date: eventDate,
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        price: parsedPrice || 0,
        isFree: isFree ?? (parsedPrice === 0),
        isMemberOnly: isMemberOnly || false,
        isFreeForMembers: isFreeForMembers || false,
        categoryId: categoryId || null,
        isRedemptionEvent: isRedemptionEvent || false,
        redemptionLimit: isRedemptionEvent ? (parsedRedemptionLimit || 1) : null,
        maxAttendees: parsedMaxAttendees,
        imageUrl: imageUrl || null,
      },
    });

    // Generate slug with event ID and update
    const slug = generateEventSlug(title, event.id);

    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { slug },
      include: {
        category: true,
      },
    });

    // Create freebies if provided
    if (freebies.length > 0) {
      await prisma.eventFreebie.createMany({
        data: freebies.map((freebie: FreebieInput) => ({
          eventId: updatedEvent.id,
          name: freebie.name,
          description: freebie.description || null,
          quantity: typeof freebie.quantity === 'string' 
            ? parseInt(freebie.quantity, 10) 
            : freebie.quantity || 1,
          imageUrl: freebie.imageUrl || null,
        })),
      });
    }

    // Fetch complete event with freebies
    const completeEvent = await prisma.event.findUnique({
      where: { id: updatedEvent.id },
      include: {
        category: true,
        freebies: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: completeEvent,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/events
 * Fetches all events for admin
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      include: {
        category: true,
        freebies: true,
        registrations: {
          select: { id: true },
        },
        customerRegistrations: {
          select: { id: true },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const eventsWithCount = events.map((event) => ({
      ...event,
      registrationCount:
        event.registrations.length + event.customerRegistrations.length,
    }));

    return NextResponse.json({
      success: true,
      data: eventsWithCount,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
      },
      { status: 500 }
    );
  }
}