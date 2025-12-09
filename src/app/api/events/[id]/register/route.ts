import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueReference } from '@/lib/paymentReference';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;
    
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      attendees,
      paymentMethod,
      paymentProofUrl,
    } = body;

    // Validate request
    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: 'At least one attendee is required' },
        { status: 400 }
      );
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
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
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is full
    const totalRegistrations = 
      event.registrations.length + event.customerRegistrations.length;
    
    if (event.maxAttendees && totalRegistrations >= event.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is already full' },
        { status: 400 }
      );
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot register for past events' },
        { status: 400 }
      );
    }

    // Check if member-only event
    if (event.isMemberOnly && !session) {
      return NextResponse.json(
        { error: 'This event is for members only. Please sign in.' },
        { status: 403 }
      );
    }

    // Determine if payment is required
    const isFreeEvent =
      event.price === 0 ||
      event.isFree ||
      (event.isFreeForMembers && session?.user?.role === 'USER');

    // Validate payment for paid events
    if (!isFreeEvent) {
      if (!paymentMethod) {
        return NextResponse.json(
          { error: 'Payment method is required' },
          { status: 400 }
        );
      }

      // Only require payment proof for GCASH and BANK_TRANSFER
      if ((paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && !paymentProofUrl) {
        return NextResponse.json(
          { error: 'Payment proof is required for online payments' },
          { status: 400 }
        );
      }
    }

    // Generate payment reference number for paid events
    let paymentReferenceNumber: string | null = null;
    if (!isFreeEvent) {
      paymentReferenceNumber = await generateUniqueReference('event');
    }

    // Calculate total amount
    const totalAmount = isFreeEvent ? 0 : event.price * attendees.length;

    // Process registrations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const registrationIds: string[] = [];

      for (const attendee of attendees) {
        // Check if user exists by email
        const existingUser = await tx.user.findUnique({
          where: { email: attendee.email },
        });

        // Determine registration type
        const isRegisteredUser = !!existingUser || attendee.email === session?.user?.email;

        if (isRegisteredUser) {
          // User registration
          const userId = existingUser?.id || session?.user?.id;

          if (!userId) {
            throw new Error('User ID not found for registered user');
          }

          // Check if user already registered for this event
          const existingRegistration = await tx.eventRegistration.findFirst({
            where: {
              userId,
              eventId: event.id,
            },
          });

          if (existingRegistration) {
            throw new Error(`${attendee.name} is already registered for this event`);
          }

          const registration = await tx.eventRegistration.create({
            data: {
              eventId: event.id,
              userId,
              attendeeName: attendee.name,
              attendeeEmail: attendee.email,
              numberOfPax: 1,
            },
          });

          // Create event pax for freebie tracking
          const pax = await tx.eventPax.create({
            data: {
              registrationId: registration.id,
              name: attendee.name,
              email: attendee.email,
            },
          });

          // Create freebie selections
          if (attendee.freebieSelections && attendee.freebieSelections.length > 0) {
            await tx.paxFreebie.createMany({
              data: attendee.freebieSelections.map((selection: { freebieId: string; selectedOption: string }) => ({
                paxId: pax.id,
                freebieId: selection.freebieId,
                quantity: 1,
              })),
            });
          }

          registrationIds.push(registration.id);
        } else {
          // Guest customer registration
          // Check if customer already exists
          let customer = await tx.customer.findFirst({
            where: { email: attendee.email },
          });

          // Create new customer if doesn't exist
          if (!customer) {
            customer = await tx.customer.create({
              data: {
                name: attendee.name,
                email: attendee.email,
              },
            });
          }

          // Check if customer already registered for this event
          const existingRegistration = await tx.customerEventRegistration.findFirst({
            where: {
              customerId: customer.id,
              eventId: event.id,
            },
          });

          if (existingRegistration) {
            throw new Error(`${attendee.name} is already registered for this event`);
          }

          const registration = await tx.customerEventRegistration.create({
            data: {
              customerId: customer.id,
              eventId: event.id,
              attendeeName: attendee.name,
              attendeeEmail: attendee.email,
              numberOfPax: 1,
            },
          });

          // Create customer event pax
          const pax = await tx.customerEventPax.create({
            data: {
              registrationId: registration.id,
              name: attendee.name,
              email: attendee.email,
            },
          });

          // Create freebie selections
          if (attendee.freebieSelections && attendee.freebieSelections.length > 0) {
            await tx.customerPaxFreebie.createMany({
              data: attendee.freebieSelections.map((selection: { freebieId: string; selectedOption: string }) => ({
                paxId: pax.id,
                freebieId: selection.freebieId,
                quantity: 1,
              })),
            });
          }

          registrationIds.push(registration.id);
        }
      }

      // Create payment record for paid events
      if (!isFreeEvent && paymentReferenceNumber) {
        const mainUserId = session?.user?.id;
        
        if (mainUserId) {
          // Create payment for logged-in user
          await tx.payment.create({
            data: {
              userId: mainUserId,
              amount: totalAmount,
              paymentMethod,
              status: 'PENDING',
              paymentReference: paymentReferenceNumber,
              referenceNumber: body.referenceNumber || null,
              proofImageUrl: paymentProofUrl || null,
              notes: `Event registration: ${event.title}`,
            },
          });
        } else {
          // Create payment for guest customer
          const mainCustomer = await tx.customer.findFirst({
            where: { email: attendees[0].email },
          });

          if (mainCustomer) {
            await tx.customerPayment.create({
              data: {
                customerId: mainCustomer.id,
                amount: totalAmount,
                paymentMethod,
                status: 'PENDING',
                paymentReference: paymentReferenceNumber,
                referenceNumber: body.referenceNumber || null,
                proofImageUrl: paymentProofUrl || null,
                notes: `Event registration: ${event.title}`,
              },
            });
          }
        }
      }

      return {
        registrationIds,
        referenceNumber: paymentReferenceNumber,
        totalAmount,
      };
    });

    // Return confirmation data
    return NextResponse.json({
      success: true,
      data: {
        registrationIds: result.registrationIds,
        paymentReference: result.referenceNumber,
        totalAmount: result.totalAmount,
        status: isFreeEvent ? 'CONFIRMED' : 'PENDING',
        attendees: attendees.map((a: { name: string; email: string }) => ({
          name: a.name,
          email: a.email,
        })),
        event: {
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          slug: event.slug,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process registration' },
      { status: 500 }
    );
  }
}