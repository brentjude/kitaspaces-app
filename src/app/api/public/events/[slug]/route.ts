import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  return `${slug}-${id.substring(0, 8)}`;
}

function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  const potentialId = parts[parts.length - 1];
  
  if (potentialId && potentialId.length === 8) {
    return potentialId;
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Extract ID from slug
    const partialId = extractIdFromSlug(slug);
    
    if (!partialId) {
      return NextResponse.json(
        { success: false, error: 'Invalid event slug format' },
        { status: 400 }
      );
    }

    // Find event where ID starts with the extracted partial ID
    const event = await prisma.event.findFirst({
      where: {
        id: {
          startsWith: partialId,
        },
      },
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
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify the full slug matches (for SEO purposes)
    const expectedSlug = generateSlug(event.title, event.id);
    if (slug !== expectedSlug) {
      // Return the correct slug for redirect on client side
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid slug',
          correctSlug: expectedSlug 
        },
        { status: 301 }
      );
    }

    // 🆕 Calculate member pricing if discount exists
    const hasMemberDiscount = 
      !event.isFree && 
      event.price > 0 && 
      event.memberDiscount && 
      event.memberDiscount > 0;

    let memberPrice = null;
    if (hasMemberDiscount && event.memberDiscount) {
      if (event.memberDiscountType === "PERCENTAGE") {
        memberPrice = event.price - (event.price * event.memberDiscount) / 100;
      } else {
        // FIXED discount
        memberPrice = Math.max(0, event.price - event.memberDiscount);
      }
    }

    // 🆕 Build response with pricing information
    const eventWithCount = {
      ...event,
      registrationCount:
        event.registrations.length + event.customerRegistrations.length,
      // 🆕 Add calculated member pricing
      hasMemberDiscount,
      memberPrice,
      // 🆕 Add freebie eligibility info
      freebiesAvailableToAll: event.hasCustomerFreebies,
      freebiesCount: event.freebies.length,
    };

    return NextResponse.json({ 
      success: true, 
      data: eventWithCount 
    });
  } catch (error) {
    console.error('Error fetching event by slug:', error);
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