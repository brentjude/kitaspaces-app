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

interface AdminGuestRegistrationRequest {
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
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await context.params;
    const body: AdminGuestRegistrationRequest = await request.json();
    const { attendees, paymentMethod, paymentProofUrl, referenceNumber } = body;

    // Validate request
    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { error: "At least one attendee is required" },
        { status: 400 }
      );
    }

    // Validate attendee data
    for (const attendee of attendees) {
      if (!attendee.name || !attendee.name.trim()) {
        return NextResponse.json(
          { error: "All attendees must have a name" },
          { status: 400 }
        );
      }

      if (!attendee.email || !attendee.email.trim()) {
        return NextResponse.json(
          { error: "All attendees must have an email" },
          { status: 400 }
        );
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attendee.email)) {
        return NextResponse.json(
          { error: `Invalid email format for ${attendee.name}` },
          { status: 400 }
        );
      }
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        freebies: true,
        registrations: { select: { id: true } },
        customerRegistrations: { select: { id: true } },
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
        {
          error: `Event is full. Only ${
            event.maxAttendees - totalRegistrations
          } spots remaining.`,
        },
        { status: 400 }
      );
    }

    // Determine if free
    const isFreeEvent = event.price === 0 || event.isFree;

    // 🆕 Check if guest customers can select freebies
    const canSelectFreebies = event.hasCustomerFreebies;

    // Validate freebie selections
    if (canSelectFreebies && event.freebies && event.freebies.length > 0) {
      for (const attendee of attendees) {
        if (!attendee.freebieSelections || attendee.freebieSelections.length === 0) {
          return NextResponse.json(
            { error: `Freebie selections are required for ${attendee.name}` },
            { status: 400 }
          );
        }

        for (const selection of attendee.freebieSelections) {
          const freebie = event.freebies.find((f) => f.id === selection.freebieId);
          if (!freebie) {
            return NextResponse.json(
              { error: `Invalid freebie selected for ${attendee.name}` },
              { status: 400 }
            );
          }

          const hasOptions = freebie.description && freebie.description.includes(",");
          if (hasOptions && !selection.selectedOption) {
            return NextResponse.json(
              { error: `Please select an option for ${freebie.name} for ${attendee.name}` },
              { status: 400 }
            );
          }
        }
      }
    } else if (!canSelectFreebies) {
      // Check if any attendee tried to select freebies
      const hasFreebieSelections = attendees.some(
        (attendee) => attendee.freebieSelections && attendee.freebieSelections.length > 0
      );

      if (hasFreebieSelections) {
        return NextResponse.json(
          { error: "Freebies are only available to members for this event" },
          { status: 400 }
        );
      }
    }

    // Validate payment for paid events
    if (!isFreeEvent) {
      if (!paymentMethod) {
        return NextResponse.json(
          { error: "Payment method is required" },
          { status: 400 }
        );
      }

      if (
        (paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") &&
        !paymentProofUrl
      ) {
        return NextResponse.json(
          { error: "Payment proof is required for online payments" },
          { status: 400 }
        );
      }

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

    const mainAttendee = attendees[0];
    const numberOfPax = attendees.length;
    const totalAmount = isFreeEvent ? 0 : event.price * numberOfPax;

    // Create registration
    const result = await prisma.$transaction(async (tx) => {
      let paymentId: string | undefined;
      let paymentReferenceNumber: string | undefined;

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
            notes: `Admin registration by ${
              session.user.name || session.user.email
            }`,
          },
        });
      }

      // Check if customer already registered
      const existingRegistration = await tx.customerEventRegistration.findFirst(
        {
          where: {
            customerId: customer.id,
            eventId: event.id,
          },
        }
      );

      if (existingRegistration) {
        throw new Error(
          `${mainAttendee.name} is already registered for this event`
        );
      }

      // Create payment record
      if (isFreeEvent) {
        // Free event - COMPLETED immediately
        paymentReferenceNumber = await generateUniqueReference("event");

        const payment = await tx.customerPayment.create({
          data: {
            customerId: customer.id,
            amount: 0,
            paymentMethod: "FREE_MEMBERSHIP",
            status: "COMPLETED",
            paymentReference: paymentReferenceNumber,
            notes: `Admin registration by ${
              session.user.name || session.user.email
            } for event: ${event.title}`,
            paidAt: new Date(),
          },
        });
        paymentId = payment.id;
      } else if (paymentMethod) {
        // Paid event
        paymentReferenceNumber = await generateUniqueReference("event");

        const paymentStatus =
          paymentMethod === "CASH" || paymentMethod === "CREDIT_CARD"
            ? "COMPLETED"
            : "PENDING";

        const payment = await tx.customerPayment.create({
          data: {
            customerId: customer.id,
            amount: totalAmount,
            paymentMethod,
            status: paymentStatus,
            paymentReference: paymentReferenceNumber,
            referenceNumber: referenceNumber || undefined,
            proofImageUrl: paymentProofUrl || undefined,
            notes: `Admin registration by ${
              session.user.name || session.user.email
            } for event: ${event.title}`,
            paidAt: paymentStatus === "COMPLETED" ? new Date() : undefined,
          },
        });
        paymentId = payment.id;
      }

      // Create CustomerEventRegistration
      const registration = await tx.customerEventRegistration.create({
        data: {
          customerId: customer.id,
          eventId: event.id,
          attendeeName: mainAttendee.name,
          attendeeEmail: mainAttendee.email,
          numberOfPax,
          paymentId,
        },
      });

      // Create CustomerEventPax for ALL attendees
      for (const attendee of attendees) {
        const pax = await tx.customerEventPax.create({
          data: {
            registrationId: registration.id,
            name: attendee.name,
            email: attendee.email,
          },
        });

        // 🆕 Only create freebie selections if allowed
        if (
          canSelectFreebies &&
          attendee.freebieSelections &&
          attendee.freebieSelections.length > 0
        ) {
          for (const selection of attendee.freebieSelections) {
            await tx.customerPaxFreebie.create({
              data: {
                paxId: pax.id,
                freebieId: selection.freebieId,
                quantity: 1,
                option: selection.selectedOption || undefined,
              },
            });
          }
        }
      }

      return {
        registrationId: registration.id,
        paymentReference: paymentReferenceNumber,
        customerId: customer.id,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        registrationId: result.registrationId,
        paymentReference: result.paymentReference,
        customerId: result.customerId,
        totalAmount,
        isFreeEvent,
        numberOfPax,
        paymentStatus: isFreeEvent
          ? "COMPLETED"
          : paymentMethod === "CASH" || paymentMethod === "CREDIT_CARD"
          ? "COMPLETED"
          : "PENDING",
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          date: event.date.toISOString(),
        },
        attendees: attendees.map((a) => ({
          name: a.name,
          email: a.email,
        })),
      },
      message: `Successfully registered ${mainAttendee.name} for ${event.title}`,
    });
  } catch (error) {
    console.error("Admin guest registration error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "This customer is already registered for this event" },
          { status: 400 }
        );
      }

      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid event reference" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create guest registration",
      },
      { status: 500 }
    );
  }
}
