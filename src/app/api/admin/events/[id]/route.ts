import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEventSlug } from "@/lib/utils/slug";
import { logAdminActivity } from "@/lib/activityLogger";

// Type definition for update request body
interface FreebieUpdate {
  id?: string;
  name: string;
  description: string | null;
  quantity: number;
}

interface UpdateEventBody {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  price?: number;
  isFree?: boolean;
  isMemberOnly?: boolean;
  isFreeForMembers?: boolean;
  categoryId?: string | null;
  isRedemptionEvent?: boolean;
  redemptionLimit?: number | null;
  maxAttendees?: number | null;
  imageUrl?: string | null;
  memberDiscount?: number | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | null;
  hasCustomerFreebies?: boolean;
  freebies?: FreebieUpdate[];
}

/**
 * GET /api/admin/events/[id]
 * Fetches a single event by ID with all relations
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id: eventId } = await context.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        category: true,
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                isMember: true,
              },
            },
            pax: true,
            payment: true,
          },
        },
        freebies: {
          include: {
            paxFreebies: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("GET event error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/events/[id]
 * Updates an event (regenerates slug if title changes)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id: eventId } = await context.params;
    const body = (await request.json()) as UpdateEventBody;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        freebies: true,
      },
    });

    if (!existingEvent) {
      // 🆕 Log failed update - event not found
      await logAdminActivity(
        session.user.id,
        'ADMIN_EVENT_UPDATED',
        `Failed to update event: Event not found (ID: ${eventId})`,
        {
          referenceId: eventId,
          referenceType: 'EVENT',
          metadata: { eventId, error: 'Event not found' },
          isSuccess: false,
          errorMessage: 'Event not found',
        }
      );

      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Track what changed for logging
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    // Build update data object with proper typing
    interface EventUpdateData {
      title?: string;
      slug?: string;
      description?: string;
      date?: Date;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      price?: number;
      isFree?: boolean;
      isMemberOnly?: boolean;
      isFreeForMembers?: boolean;
      categoryId?: string | null;
      isRedemptionEvent?: boolean;
      redemptionLimit?: number | null;
      maxAttendees?: number | null;
      imageUrl?: string | null;
      memberDiscount?: number | null;
      memberDiscountType?: string | null;
      memberDiscountedPrice?: number | null;
      hasCustomerFreebies?: boolean;
    }

    const updateData: EventUpdateData = {};

    if (body.title !== undefined && body.title !== existingEvent.title) {
      changes.title = { from: existingEvent.title, to: body.title };
      updateData.title = body.title;
      updateData.slug = generateEventSlug(body.title, eventId);
    }
    if (body.description !== undefined && body.description !== existingEvent.description) {
      changes.description = { from: existingEvent.description, to: body.description };
      updateData.description = body.description;
    }
    if (body.date !== undefined) {
      const newDate = new Date(body.date);
      if (newDate.getTime() !== existingEvent.date.getTime()) {
        changes.date = { 
          from: existingEvent.date.toISOString(), 
          to: newDate.toISOString() 
        };
        updateData.date = newDate;
      }
    }
    if (body.startTime !== undefined && body.startTime !== existingEvent.startTime) {
      changes.startTime = { from: existingEvent.startTime, to: body.startTime };
      updateData.startTime = body.startTime;
    }
    if (body.endTime !== undefined && body.endTime !== existingEvent.endTime) {
      changes.endTime = { from: existingEvent.endTime, to: body.endTime };
      updateData.endTime = body.endTime;
    }
    if (body.location !== undefined && body.location !== existingEvent.location) {
      changes.location = { from: existingEvent.location, to: body.location };
      updateData.location = body.location;
    }
    if (body.price !== undefined && body.price !== existingEvent.price) {
      changes.price = { from: existingEvent.price, to: body.price };
      updateData.price = body.price;
    }
    if (body.isFree !== undefined && body.isFree !== existingEvent.isFree) {
      changes.isFree = { from: existingEvent.isFree, to: body.isFree };
      updateData.isFree = body.isFree;
    }
    if (body.isMemberOnly !== undefined && body.isMemberOnly !== existingEvent.isMemberOnly) {
      changes.isMemberOnly = { from: existingEvent.isMemberOnly, to: body.isMemberOnly };
      updateData.isMemberOnly = body.isMemberOnly;
    }
    if (body.categoryId !== undefined && body.categoryId !== existingEvent.categoryId) {
      changes.categoryId = { from: existingEvent.categoryId, to: body.categoryId };
      updateData.categoryId = body.categoryId;
    }
    if (body.isRedemptionEvent !== undefined && body.isRedemptionEvent !== existingEvent.isRedemptionEvent) {
      changes.isRedemptionEvent = { from: existingEvent.isRedemptionEvent, to: body.isRedemptionEvent };
      updateData.isRedemptionEvent = body.isRedemptionEvent;
    }
    if (body.redemptionLimit !== undefined && body.redemptionLimit !== existingEvent.redemptionLimit) {
      changes.redemptionLimit = { from: existingEvent.redemptionLimit, to: body.redemptionLimit };
      updateData.redemptionLimit = body.redemptionLimit;
    }
    if (body.maxAttendees !== undefined && body.maxAttendees !== existingEvent.maxAttendees) {
      changes.maxAttendees = { from: existingEvent.maxAttendees, to: body.maxAttendees };
      updateData.maxAttendees = body.maxAttendees;
    }
    if (body.imageUrl !== undefined && body.imageUrl !== existingEvent.imageUrl) {
      changes.imageUrl = { from: existingEvent.imageUrl, to: body.imageUrl };
      updateData.imageUrl = body.imageUrl;
    }

    // 🆕 Track discount changes
    if (body.memberDiscount !== undefined) {
      const newDiscount = body.memberDiscount && body.memberDiscount > 0 ? body.memberDiscount : null;
      if (newDiscount !== existingEvent.memberDiscount) {
        changes.memberDiscount = { from: existingEvent.memberDiscount, to: newDiscount };
        updateData.memberDiscount = newDiscount;
      }
    }
    if (body.memberDiscountType !== undefined) {
      const newDiscountType = body.memberDiscount && body.memberDiscount > 0 ? body.memberDiscountType : null;
      if (newDiscountType !== existingEvent.memberDiscountType) {
        changes.memberDiscountType = { from: existingEvent.memberDiscountType, to: newDiscountType };
        updateData.memberDiscountType = newDiscountType;
      }
    }
    if (body.memberDiscountedPrice !== undefined) {
      const newDiscountedPrice = body.memberDiscount && body.memberDiscount > 0 ? body.memberDiscountedPrice : null;
      if (newDiscountedPrice !== existingEvent.memberDiscountedPrice) {
        changes.memberDiscountedPrice = { from: existingEvent.memberDiscountedPrice, to: newDiscountedPrice };
        updateData.memberDiscountedPrice = newDiscountedPrice;
      }
    }

    // 🆕 Track customer freebies changes
    if (body.hasCustomerFreebies !== undefined && body.hasCustomerFreebies !== existingEvent.hasCustomerFreebies) {
      changes.hasCustomerFreebies = { from: existingEvent.hasCustomerFreebies, to: body.hasCustomerFreebies };
      updateData.hasCustomerFreebies = body.hasCustomerFreebies;
    }

    // Handle freebies update if provided
    let freebiesChanged = false;
    if (body.freebies !== undefined) {
      // Get existing freebie IDs
      const existingFreebieIds = existingEvent.freebies.map((f) => f.id);
      const incomingFreebieIds = body.freebies
        .filter((f) => f.id && !f.id.startsWith("new-"))
        .map((f) => f.id as string);

      // Find freebies to delete (existing but not in incoming)
      const freebiesToDelete = existingFreebieIds.filter(
        (id) => !incomingFreebieIds.includes(id)
      );

      if (freebiesToDelete.length > 0) {
        freebiesChanged = true;
        // First delete pax freebies (both user and customer)
        await prisma.paxFreebie.deleteMany({
          where: {
            freebieId: { in: freebiesToDelete },
          },
        });

        await prisma.customerPaxFreebie.deleteMany({
          where: {
            freebieId: { in: freebiesToDelete },
          },
        });

        // Then delete the freebies
        await prisma.eventFreebie.deleteMany({
          where: {
            id: { in: freebiesToDelete },
          },
        });
      }

      // Update existing and create new freebies
      for (const freebie of body.freebies) {
        if (freebie.id && !freebie.id.startsWith("new-")) {
          // Check if freebie was modified
          const existingFreebie = existingEvent.freebies.find(f => f.id === freebie.id);
          if (existingFreebie && (
            existingFreebie.name !== freebie.name ||
            existingFreebie.description !== freebie.description ||
            existingFreebie.quantity !== freebie.quantity
          )) {
            freebiesChanged = true;
          }

          // Update existing freebie
          await prisma.eventFreebie.update({
            where: { id: freebie.id },
            data: {
              name: freebie.name,
              description: freebie.description,
              quantity: freebie.quantity,
            },
          });
        } else {
          freebiesChanged = true;
          // Create new freebie
          await prisma.eventFreebie.create({
            data: {
              eventId: eventId,
              name: freebie.name,
              description: freebie.description,
              quantity: freebie.quantity,
            },
          });
        }
      }

      if (freebiesChanged) {
        changes.freebies = {
          from: `${existingEvent.freebies.length} freebies`,
          to: `${body.freebies.length} freebies`,
        };
      }
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        category: true,
        registrations: true,
        freebies: true,
      },
    });

    const changesSummary: Record<string, unknown> = {};
    if (Object.keys(changes).length > 0) {
      Object.entries(changes).forEach(([key, value]) => {
        changesSummary[key] = {
          from: value.from,
          to: value.to,
        };
      });
    }

    // 🆕 Log successful event update
    await logAdminActivity(
      session.user.id,
      'ADMIN_EVENT_UPDATED',
      `Updated event "${event.title}" (${event.slug})`,
      {
        referenceId: eventId,
        referenceType: 'EVENT',
        metadata: {
          eventId,
          title: event.title,
          slug: event.slug,
          changedFields: Object.keys(changes).join(', '),
          changeCount: Object.keys(changes).length,
          changesDetail: JSON.stringify(changes),
          freebiesChanged,
        },
      }
    );


    return NextResponse.json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("PATCH event error:", error);

    // 🆕 Log error
    const session = await getServerSession(authOptions);
    const { id: eventId } = await context.params;
    if (session?.user) {
      await logAdminActivity(
        session.user.id,
        'ADMIN_EVENT_UPDATED',
        `Failed to update event (ID: ${eventId}): ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          referenceId: eventId,
          referenceType: 'EVENT',
          metadata: { eventId, error: error instanceof Error ? error.message : 'Unknown error' },
          isSuccess: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Deletes an event and all related data
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id: eventId } = await context.params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            pax: true,
          },
        },
        customerRegistrations: true,
        freebies: true,
      },
    });

    if (!existingEvent) {
      // 🆕 Log failed deletion - event not found
      await logAdminActivity(
        session.user.id,
        'ADMIN_EVENT_DELETED',
        `Failed to delete event: Event not found (ID: ${eventId})`,
        {
          referenceId: eventId,
          referenceType: 'EVENT',
          metadata: { eventId, error: 'Event not found' },
          isSuccess: false,
          errorMessage: 'Event not found',
        }
      );

      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Store event details before deletion
    const eventTitle = existingEvent.title;
    const eventSlug = existingEvent.slug;
    const registrationCount = existingEvent.registrations.length;
    const customerRegistrationCount = existingEvent.customerRegistrations.length;
    const paxCount = existingEvent.registrations.reduce(
      (sum, reg) => sum + reg.pax.length,
      0
    );
    const freebiesCount = existingEvent.freebies.length;

    // Delete in correct order due to foreign key constraints

    // 1. Delete pax freebies
    await prisma.paxFreebie.deleteMany({
      where: {
        pax: {
          registration: {
            eventId: eventId,
          },
        },
      },
    });

    // 2. Delete customer pax freebies
    await prisma.customerPaxFreebie.deleteMany({
      where: {
        pax: {
          registration: {
            eventId: eventId,
          },
        },
      },
    });

    // 3. Delete event pax
    await prisma.eventPax.deleteMany({
      where: {
        registration: {
          eventId: eventId,
        },
      },
    });

    // 4. Delete customer event pax
    await prisma.customerEventPax.deleteMany({
      where: {
        registration: {
          eventId: eventId,
        },
      },
    });

    // 5. Delete daily use redemptions
    await prisma.dailyUseRedemption.deleteMany({
      where: { eventId: eventId },
    });

    // 6. Delete customer daily use redemptions
    await prisma.customerDailyUseRedemption.deleteMany({
      where: { eventId: eventId },
    });

    // 7. Delete event registrations
    await prisma.eventRegistration.deleteMany({
      where: { eventId: eventId },
    });

    // 8. Delete customer event registrations
    await prisma.customerEventRegistration.deleteMany({
      where: { eventId: eventId },
    });

    // 9. Delete event freebies
    await prisma.eventFreebie.deleteMany({
      where: { eventId: eventId },
    });

    // 10. Finally delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    // 🆕 Log successful event deletion
    await logAdminActivity(
      session.user.id,
      'ADMIN_EVENT_DELETED',
      `Deleted event "${eventTitle}" (${eventSlug})`,
      {
        referenceId: eventId,
        referenceType: 'EVENT',
        metadata: {
          eventId,
          title: eventTitle,
          slug: eventSlug,
          registrationsDeleted: registrationCount,
          customerRegistrationsDeleted: customerRegistrationCount,
          paxDeleted: paxCount,
          freebiesDeleted: freebiesCount,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Event and all related data deleted successfully",
      data: {
        registrationsDeleted: registrationCount,
        customerRegistrationsDeleted: customerRegistrationCount,
        paxDeleted: paxCount,
        freebiesDeleted: freebiesCount,
      },
    });
  } catch (error) {
    console.error("DELETE event error:", error);

    // 🆕 Log error
    const session = await getServerSession(authOptions);
    const { id: eventId } = await context.params;
    if (session?.user) {
      await logAdminActivity(
        session.user.id,
        'ADMIN_EVENT_DELETED',
        `Failed to delete event (ID: ${eventId}): ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          referenceId: eventId,
          referenceType: 'EVENT',
          metadata: { eventId, error: error instanceof Error ? error.message : 'Unknown error' },
          isSuccess: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete event",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}