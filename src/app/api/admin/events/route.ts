import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEventSlug } from "@/lib/utils/slug";
import { logAdminActivity } from "@/lib/activityLogger";

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
  categoryId?: string | null;
  isRedemptionEvent?: boolean;
  redemptionLimit?: number | string | null;
  maxAttendees?: number | string | null;
  imageUrl?: string | null;
  memberDiscount?: number | string | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | string | null;
  hasCustomerFreebies?: boolean;
  freebies?: FreebieInput[];
}

/**
 * POST /api/admin/events
 * Creates a new event with auto-generated slug
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateEventBody;

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
      categoryId,
      isRedemptionEvent,
      redemptionLimit,
      maxAttendees,
      imageUrl,
      memberDiscount,
      memberDiscountType,
      memberDiscountedPrice,
      hasCustomerFreebies,
      freebies = [],
    } = body;

    // Validate required fields
    if (!title || !description || !date) {
      // 🆕 Log failed creation attempt
      await logAdminActivity(
        session.user.id,
        "ADMIN_EVENT_CREATED",
        `Failed to create event: Missing required fields`,
        {
          metadata: { title, error: "Missing required fields" },
          isSuccess: false,
          errorMessage: "Title, description, and date are required",
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: "Title, description, and date are required",
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
        // 🆕 Log invalid category attempt
        await logAdminActivity(
          session.user.id,
          "ADMIN_EVENT_CREATED",
          `Failed to create event "${title}": Invalid category`,
          {
            metadata: { title, categoryId, error: "Invalid category" },
            isSuccess: false,
            errorMessage: `Category with ID ${categoryId} not found`,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error: "Invalid category",
            details: `Category with ID ${categoryId} not found`,
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
        throw new Error("Invalid date format");
      }
    } catch (error) {
      // 🆕 Log invalid date attempt
      await logAdminActivity(
        session.user.id,
        "ADMIN_EVENT_CREATED",
        `Failed to create event "${title}": Invalid date format`,
        {
          metadata: { title, date, error: "Invalid date format" },
          isSuccess: false,
          errorMessage: error instanceof Error ? error.message : "Invalid date",
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid date",
          details: "Please provide a valid date in ISO format",
        },
        { status: 400 }
      );
    }

    // Parse numeric values
    const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
    const parsedRedemptionLimit = redemptionLimit
      ? typeof redemptionLimit === "string"
        ? parseInt(redemptionLimit, 10)
        : redemptionLimit
      : null;
    const parsedMaxAttendees = maxAttendees
      ? typeof maxAttendees === "string"
        ? parseInt(maxAttendees, 10)
        : maxAttendees
      : null;

    const parsedMemberDiscount = memberDiscount
      ? typeof memberDiscount === "string"
        ? parseFloat(memberDiscount)
        : memberDiscount
      : null;
    const parsedMemberDiscountedPrice = memberDiscountedPrice
      ? typeof memberDiscountedPrice === "string"
        ? parseFloat(memberDiscountedPrice)
        : memberDiscountedPrice
      : null;

    // Create event first without slug
    const event = await prisma.event.create({
      data: {
        title,
        slug: "", // Temporary slug
        description,
        date: eventDate,
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        price: parsedPrice || 0,
        isFree: isFree ?? parsedPrice === 0,
        isMemberOnly: isMemberOnly || false,
        categoryId: categoryId || null,
        isRedemptionEvent: isRedemptionEvent || false,
        redemptionLimit: isRedemptionEvent ? parsedRedemptionLimit || 1 : null,
        maxAttendees: parsedMaxAttendees,
        imageUrl: imageUrl || null,
        memberDiscount:
          parsedMemberDiscount && parsedMemberDiscount > 0
            ? parsedMemberDiscount
            : null,
        memberDiscountType:
          parsedMemberDiscount && parsedMemberDiscount > 0
            ? memberDiscountType || "FIXED"
            : null,
        memberDiscountedPrice:
          parsedMemberDiscountedPrice &&
          parsedMemberDiscount &&
          parsedMemberDiscount > 0
            ? parsedMemberDiscountedPrice
            : null,
        hasCustomerFreebies: hasCustomerFreebies ?? true,
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
          quantity:
            typeof freebie.quantity === "string"
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

    // 🆕 Log successful event creation
    await logAdminActivity(
      session.user.id,
      "ADMIN_EVENT_CREATED",
      `Created event "${title}" (${slug})`,
      {
        referenceId: event.id,
        referenceType: "EVENT",
        metadata: {
          eventId: event.id,
          title,
          slug,
          date: eventDate.toISOString(),
          price: parsedPrice,
          isFree: isFree ?? parsedPrice === 0,
          isMemberOnly: isMemberOnly || false,
          isRedemptionEvent: isRedemptionEvent || false,
          memberDiscount: parsedMemberDiscount,
          memberDiscountType,
          hasCustomerFreebies: hasCustomerFreebies ?? true,
          freebiesCount: freebies.length,
          categoryId: categoryId || null,
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: completeEvent,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating event:", error);

    // 🆕 Log error
    const session = await getServerSession(authOptions);
    if (session?.user) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_EVENT_CREATED",
        `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          isSuccess: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event",
        details: error instanceof Error ? error.message : "Unknown error",
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      include: {
        category: true,
        freebies: true,
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            payment: true,
            pax: true, // 🔧 Include EventPax for member registrations
          },
        },
        customerRegistrations: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                contactNumber: true,
              },
            },
            payment: true,
            pax: true, // 🔧 Include CustomerEventPax for customer registrations
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
