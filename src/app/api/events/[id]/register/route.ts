import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueReference } from "@/lib/paymentReference";

interface AttendeeData {
  name: string;
  email: string;
  freebieSelections?: Array<{
    freebieId: string;
    selectedOption?: string;
  }>;
}

interface RegistrationRequest {
  attendees: AttendeeData[];
  paymentMethod?: "GCASH" | "BANK_TRANSFER" | "CASH" | "CREDIT_CARD";
  paymentProofUrl?: string;
  referenceNumber?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params;

    const session = await getServerSession(authOptions);
    const body: RegistrationRequest = await request.json();

    const { attendees, paymentMethod, paymentProofUrl, referenceNumber } = body;

    // Validate request
    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: "At least one attendee is required" },
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
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is full
    const totalRegistrations =
      event.registrations.length + event.customerRegistrations.length;

    if (
      event.maxAttendees &&
      totalRegistrations + attendees.length > event.maxAttendees
    ) {
      return NextResponse.json(
        { error: "Event is already full" },
        { status: 400 }
      );
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return NextResponse.json(
        { error: "Cannot register for past events" },
        { status: 400 }
      );
    }

    // Check if member-only event
    if (event.isMemberOnly && (!session?.user || !session.user.isMember)) {
      return NextResponse.json(
        { error: "This event is for members only" },
        { status: 403 }
      );
    }

    // Determine if payment is required
    const isMember = session?.user?.isMember || false;
    const isFreeEvent =
      event.price === 0 || event.isFree || (event.isFreeForMembers && isMember);

    // Validate payment for paid events
    if (!isFreeEvent) {
      if (!paymentMethod) {
        return NextResponse.json(
          { error: "Payment method is required" },
          { status: 400 }
        );
      }

      // Require payment proof for GCASH and BANK_TRANSFER
      if (
        (paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") &&
        !paymentProofUrl
      ) {
        return NextResponse.json(
          { error: "Payment proof is required for online payments" },
          { status: 400 }
        );
      }

      // Require reference number for online payments
      if (
        (paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") &&
        !referenceNumber
      ) {
        return NextResponse.json(
          { error: "Reference number is required for online payments" },
          { status: 400 }
        );
      }
    }

    // Determine main payer info
    const mainAttendee = attendees[0];
    const numberOfPax = attendees.length;
    const totalAmount = isFreeEvent ? 0 : event.price * numberOfPax;

    // Process registration in transaction
    const result = await prisma.$transaction(async (tx) => {
      let paymentId: string | undefined;
      let registrationId: string;
      let paymentReferenceNumber: string | undefined;

      // === REGISTERED USER (MEMBER OR NON-MEMBER) ===
      if (session?.user?.id) {
        // Check if already registered
        const existingRegistration = await tx.eventRegistration.findFirst({
          where: {
            userId: session.user.id,
            eventId: event.id,
          },
        });

        if (existingRegistration) {
          throw new Error("You are already registered for this event");
        }

        // Create Payment if not free
        if (!isFreeEvent && paymentMethod) {
          paymentReferenceNumber = await generateUniqueReference("event");

          const payment = await tx.payment.create({
            data: {
              userId: session.user.id,
              amount: totalAmount,
              paymentMethod,
              status: "PENDING",
              paymentReference: paymentReferenceNumber,
              referenceNumber: referenceNumber || undefined,
              proofImageUrl: paymentProofUrl || undefined,
              notes: `Event registration: ${event.title}`,
            },
          });
          paymentId = payment.id;
        }

        // Create EventRegistration (main payer only)
        const registration = await tx.eventRegistration.create({
          data: {
            userId: session.user.id,
            eventId: event.id,
            attendeeName: mainAttendee.name,
            attendeeEmail: mainAttendee.email,
            numberOfPax,
            paymentId: paymentId || undefined,
          },
        });
        registrationId = registration.id;

        // Create EventPax for ALL attendees (including main payer)
        for (const attendee of attendees) {
          const pax = await tx.eventPax.create({
            data: {
              registrationId: registration.id,
              name: attendee.name,
              email: attendee.email,
            },
          });

          // Create freebie selections for this pax WITH OPTION
          if (
            attendee.freebieSelections &&
            attendee.freebieSelections.length > 0
          ) {
            for (const selection of attendee.freebieSelections) {
              await tx.paxFreebie.create({
                data: {
                  paxId: pax.id,
                  freebieId: selection.freebieId,
                  quantity: 1,
                  option: selection.selectedOption || undefined, // ✅ Save selected option
                },
              });
            }
          }
        }

        return {
          registrationId: registration.id,
          paymentReference: paymentReferenceNumber,
          totalAmount,
          type: "user" as const,
        };
      }
      // === GUEST CUSTOMER (NOT LOGGED IN) ===
      else {
        // Find or create customer
        let customer = await tx.customer.findFirst({
          where: {
            email: mainAttendee.email,
          },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: mainAttendee.name,
              email: mainAttendee.email,
              notes: "Walk-in guest registration",
            },
          });
        }

        // Check if customer already registered
        const existingRegistration =
          await tx.customerEventRegistration.findFirst({
            where: {
              customerId: customer.id,
              eventId: event.id,
            },
          });

        if (existingRegistration) {
          throw new Error(
            `${mainAttendee.name} is already registered for this event`
          );
        }

        // Create CustomerPayment if not free
        if (!isFreeEvent && paymentMethod) {
          paymentReferenceNumber = await generateUniqueReference("event");

          const payment = await tx.customerPayment.create({
            data: {
              customerId: customer.id,
              amount: totalAmount,
              paymentMethod,
              status: "PENDING",
              paymentReference: paymentReferenceNumber,
              referenceNumber: referenceNumber || undefined,
              proofImageUrl: paymentProofUrl || undefined,
              notes: `Event registration: ${event.title}`,
            },
          });
          paymentId = payment.id;
        }

        // Create CustomerEventRegistration (main payer only)
        const registration = await tx.customerEventRegistration.create({
          data: {
            customerId: customer.id,
            eventId: event.id,
            attendeeName: mainAttendee.name,
            attendeeEmail: mainAttendee.email,
            numberOfPax,
            paymentId: paymentId || undefined,
          },
        });
        registrationId = registration.id;

        // Create CustomerEventPax for ALL attendees (including main payer)
        for (const attendee of attendees) {
          const pax = await tx.customerEventPax.create({
            data: {
              registrationId: registration.id,
              name: attendee.name,
              email: attendee.email,
            },
          });

          // Create freebie selections for this pax WITH OPTION
          if (
            attendee.freebieSelections &&
            attendee.freebieSelections.length > 0
          ) {
            for (const selection of attendee.freebieSelections) {
              await tx.customerPaxFreebie.create({
                data: {
                  paxId: pax.id,
                  freebieId: selection.freebieId,
                  quantity: 1,
                  option: selection.selectedOption || undefined, // ✅ Save selected option
                },
              });
            }
          }
        }

        return {
          registrationId: registration.id,
          paymentReference: paymentReferenceNumber,
          totalAmount,
          type: "customer" as const,
        };
      }
    });

    // Return confirmation data
    return NextResponse.json({
      success: true,
      data: {
        registrationId: result.registrationId,
        paymentReference: result.paymentReference,
        totalAmount: result.totalAmount,
        status: isFreeEvent ? "CONFIRMED" : "PENDING",
        attendees: attendees.map((a) => ({
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
      message: `Registration ${isFreeEvent ? "confirmed" : "submitted"}!`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process registration",
      },
      { status: 500 }
    );
  }
}
