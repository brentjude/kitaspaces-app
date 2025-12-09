import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEventSlug } from '@/lib/utils/slug';

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

    const body = await request.json();
    console.log('📥 Received event data:', body);

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

      console.log('✅ Category validated:', categoryExists.name);
    }

    // Parse date
    let eventDate: Date;
    try {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid date',
          details: 'Please provide a valid date in ISO format' 
        },
        { status: 400 }
      );
    }

    console.log('📅 Creating event:', title);

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
        price: parseFloat(price) || 0,
        isFree: isFree ?? (parseFloat(price) === 0),
        isMemberOnly: isMemberOnly || false,
        isFreeForMembers: isFreeForMembers || false,
        categoryId: categoryId || null,
        isRedemptionEvent: isRedemptionEvent || false,
        redemptionLimit: isRedemptionEvent ? (parseInt(redemptionLimit) || 1) : null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        imageUrl: imageUrl || null,
      },
    });

    console.log('✅ Event created with ID:', event.id);

    // Generate slug with event ID and update
    const slug = generateEventSlug(title, event.id);
    console.log('🔗 Generated slug:', slug);

    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { slug },
      include: {
        category: true,
      },
    });

    console.log('✅ Event updated with slug');

    // Create freebies if provided
    if (freebies.length > 0) {
      console.log(`🎁 Creating ${freebies.length} freebies`);
      
      await prisma.eventFreebie.createMany({
        data: freebies.map((freebie: any) => ({
          eventId: updatedEvent.id,
          name: freebie.name,
          description: freebie.description || null,
          quantity: parseInt(freebie.quantity) || 1,
          imageUrl: freebie.imageUrl || null,
        })),
      });

      console.log('✅ Freebies created');
    }

    // Fetch complete event with freebies
    const completeEvent = await prisma.event.findUnique({
      where: { id: updatedEvent.id },
      include: {
        category: true,
        freebies: true,
      },
    });

    console.log('✅ Event creation complete:', completeEvent?.title);

    return NextResponse.json({
      success: true,
      data: completeEvent,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

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
export async function GET(request: Request) {
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