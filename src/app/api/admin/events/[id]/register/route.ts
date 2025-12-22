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

interface AdminUserRegistrationRequest {
  userId: string;
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

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await context.params;
    const body: AdminUserRegistrationRequest = await request.json();
    const { userId, attendees, paymentMethod, paymentProofUrl, referenceNumber } = body;

    // Validate request
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attendee.email)) {
        return NextResponse.json(
          { error: `Invalid email format for ${attendee.name}` },
          { status: 400 }
        );
      }
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isMember: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
        {
          error: `Event is full. Only ${
            event.maxAttendees - totalRegistrations
          } spots remaining.`,
        },
        { status: 400 }
      );
    }

    // Check if member-only event
    if (event.isMemberOnly && !user.isMember) {
      return NextResponse.json(
        { error: "This event is for members only" },
        { status: 403 }
      );
    }

    // 🆕 Calculate price with member discount
    let pricePerAttendee = event.price;
    let discountApplied = false;

    if (
      user.isMember &&
      !event.isFree &&
      event.price > 0 &&
      event.memberDiscount &&
      event.memberDiscount > 0
    ) {
      discountApplied = true;

      if (event.memberDiscountType === "PERCENTAGE") {
        const discountAmount = (event.price * event.memberDiscount) / 100;
        pricePerAttendee = event.price - discountAmount;
      } else {
        // FIXED discount
        pricePerAttendee = Math.max(0, event.price - event.memberDiscount);
      }
    }

    const isFreeEvent = event.price === 0 || event.isFree || pricePerAttendee === 0;

    // 🆕 Determine if user can select freebies
    const canSelectFreebies = event.hasCustomerFreebies || user.isMember;

    // Validate freebie selections
    if (canSelectFreebies && event.freebies && event.freebies.length > 0) {
      for (const attendee of attendees) {
        if (
          !attendee.freebieSelections ||
          attendee.freebieSelections.length === 0
        ) {
          return NextResponse.json(
            { error: `Freebie selections are required for ${attendee.name}` },
            { status: 400 }
          );
        }

        for (const selection of attendee.freebieSelections) {
          const freebie = event.freebies.find(
            (f) => f.id === selection.freebieId
          );

          if (!freebie) {
            return NextResponse.json(
              { error: `Invalid freebie selected for ${attendee.name}` },
              { status: 400 }
            );
          }

          const hasOptions =
            freebie.description && freebie.description.includes(",");

          if (hasOptions && !selection.selectedOption) {
            return NextResponse.json(
              {
                error: `Please select an option for ${freebie.name} for ${attendee.name}`,
              },
              { status: 400 }
            );
          }
        }
      }
    } else if (!canSelectFreebies) {
      // Check if any attendee tried to select freebies
      const hasFreebieSelections = attendees.some(
        (attendee) =>
          attendee.freebieSelections && attendee.freebieSelections.length > 0
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

    const numberOfPax = attendees.length;
    const totalAmount = isFreeEvent ? 0 : pricePerAttendee * numberOfPax;
    const originalTotalAmount = event.price * numberOfPax;

    // Build payment notes
    let paymentNotes = `Admin registration by ${
      session.user.name || session.user.email
    } for event: ${event.title}`;

    if (discountApplied) {
      paymentNotes += ` | Member discount applied: ${
        event.memberDiscountType === "PERCENTAGE"
          ? `${event.memberDiscount}%`
          : `₱${event.memberDiscount}`
      }`;
      paymentNotes += ` | Original: ₱${originalTotalAmount.toFixed(
        2
      )}, Discounted: ₱${totalAmount.toFixed(2)}`;
    }

    // Create registration
    const result = await prisma.$transaction(async (tx) => {
      // Check if already registered
      const existingRegistration = await tx.eventRegistration.findFirst({
        where: {
          userId: user.id,
          eventId: event.id,
        },
      });

      if (existingRegistration) {
        throw new Error(
          `${user.name} is already registered for this event`
        );
      }

      let paymentId: string | undefined;
      let paymentReferenceNumber: string | undefined;

      // Create payment record
      if (isFreeEvent) {
        paymentReferenceNumber = await generateUniqueReference("event");

        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: 0,
            paymentMethod: "CASH",
            status: "COMPLETED",
            paymentReference: paymentReferenceNumber,
            notes: `Free event registration by admin: ${event.title}${
              user.isMember ? " (Member)" : ""
            }${discountApplied ? " - 100% member discount applied" : ""}`,
            paidAt: new Date(),
          },
        });
        paymentId = payment.id;
      } else if (paymentMethod) {
        paymentReferenceNumber = await generateUniqueReference("event");

        const paymentStatus =
          paymentMethod === "CASH" || paymentMethod === "CREDIT_CARD"
            ? "COMPLETED"
            : "PENDING";

        const payment = await tx.payment.create({
          data: {
            userId: user.id,
            amount: totalAmount,
            paymentMethod,
            status: paymentStatus,
            paymentReference: paymentReferenceNumber,
            referenceNumber: referenceNumber || undefined,
            proofImageUrl: paymentProofUrl || undefined,
            notes: paymentNotes,
            paidAt: paymentStatus === "COMPLETED" ? new Date() : undefined,
          },
        });
        paymentId = payment.id;
      }

      // Create EventRegistration
      const registration = await tx.eventRegistration.create({
        data: {
          userId: user.id,
          eventId: event.id,
          attendeeName: attendees[0].name,
          attendeeEmail: attendees[0].email,
          numberOfPax,
          paymentId,
        },
      });

      // Create EventPax for ALL attendees
      for (const attendee of attendees) {
        const pax = await tx.eventPax.create({
          data: {
            registrationId: registration.id,
            name: attendee.name,
            email: attendee.email,
          },
        });

        // Create freebie selections if eligible
        if (
          canSelectFreebies &&
          attendee.freebieSelections &&
          attendee.freebieSelections.length > 0
        ) {
          for (const selection of attendee.freebieSelections) {
            await tx.paxFreebie.create({
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
        userId: user.id,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        registrationId: result.registrationId,
        paymentReference: result.paymentReference,
        userId: result.userId,
        totalAmount,
        originalAmount: originalTotalAmount,
        discountAmount: discountApplied
          ? originalTotalAmount - totalAmount
          : 0,
        isMemberDiscountApplied: discountApplied,
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
      message: `Successfully registered ${user.name} for ${event.title}${
        discountApplied
          ? ` with ₱${(originalTotalAmount - totalAmount).toFixed(
              2
            )} member discount`
          : ""
      }`,
    });
  } catch (error) {
    console.error("Admin user registration error:", error);

    if (error instanceof Error) {
      if (error.message.includes("already registered")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "This user is already registered for this event" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create user registration",
      },
      { status: 500 }
    );
  }
}