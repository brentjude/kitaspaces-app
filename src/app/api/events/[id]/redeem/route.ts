import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const eventId = params.id;
    const body = await request.json();
    const { freebieSelections } = body;

    // Get event details with existing redemption count
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        freebies: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.isRedemptionEvent) {
      return NextResponse.json(
        { success: false, error: "This is not a redemption event" },
        { status: 400 }
      );
    }

    // Check if event is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() !== today.getTime()) {
      return NextResponse.json(
        {
          success: false,
          error: "This redemption event is not available today",
        },
        { status: 400 }
      );
    }

    // Check redemption limit (daily limit per user)
    if (event.redemptionLimit) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayRedemptions = await prisma.dailyUseRedemption.count({
        where: {
          eventId: event.id,
          userId: session.user.id,
          redeemedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (todayRedemptions >= event.redemptionLimit) {
        return NextResponse.json(
          {
            success: false,
            error: `You have reached the daily redemption limit of ${event.redemptionLimit} for this event`,
          },
          { status: 400 }
        );
      }
    }

    // Build freebie notes
    let freebieNotes = "";
    if (freebieSelections && freebieSelections.length > 0) {
      const freebiesList = freebieSelections
        .map((s: { freebieId: string; selectedOption?: string }) => {
          const freebie = event.freebies.find((f) => f.id === s.freebieId);
          if (!freebie) return null;

          if (s.selectedOption) {
            return `${freebie.name} (${s.selectedOption})`;
          }
          return freebie.name;
        })
        .filter(Boolean)
        .join(", ");

      freebieNotes = freebiesList ? `Freebies: ${freebiesList}` : "";
    }

    // Create redemption record - this is the primary record for redemption events
    const redemption = await prisma.dailyUseRedemption.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        notes: freebieNotes || `Redeemed ${event.title}`,
      },
    });

    // Also create EventRegistration for tracking in the events system
    // This allows the redemption to show up in event registrations list
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        numberOfPax: 1,
      },
    });

    // Create EventPax record
    const pax = await prisma.eventPax.create({
      data: {
        registrationId: registration.id,
        name: session.user.name || "",
        email: session.user.email || "",
      },
    });

    // If there are freebies with selections, create freebie records
    if (freebieSelections && freebieSelections.length > 0) {
      for (const selection of freebieSelections) {
        await prisma.paxFreebie.create({
          data: {
            paxId: pax.id,
            freebieId: selection.freebieId,
            quantity: 1,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        redemptionId: redemption.id,
        registrationId: registration.id,
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
        },
        pax: {
          id: pax.id,
          name: pax.name,
          email: pax.email,
        },
        freebies: event.freebies,
        redeemedAt: redemption.redeemedAt,
        message: "Redemption successful!",
      },
    });
  } catch (error) {
    console.error("Redemption error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process redemption",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
