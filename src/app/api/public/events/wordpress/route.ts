import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { validateWordPressApiKey } from "@/lib/wordpress/api-key-validator";
import { checkRateLimit } from "@/lib/wordpress/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify API Key
    const apiKey = request.headers.get("x-api-key");
    if (!validateWordPressApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // 2. Rate Limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const categoryId = searchParams.get("categoryId") || "";

    // 4. Build query (removed isFeatured since it doesn't exist)
    const where: Prisma.EventWhereInput = {
      AND: [
        {
          date: {
            gte: new Date(),
          },
        },
      ],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 5. Fetch events with only existing fields
    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        startTime: true,
        endTime: true,
        location: true,
        price: true,
        isFree: true,
        imageUrl: true,
        maxAttendees: true,
        memberDiscount: true,
        memberDiscountType: true,
        categoryId: true,
        _count: {
          select: {
            registrations: true,
            customerRegistrations: true,
          },
        },
      },
      orderBy: { date: "asc" },
      take: limit,
    });

    // Fetch categories separately if needed
    const categoryIds = [...new Set(events.map(e => e.categoryId).filter(Boolean))];
    const categories = categoryIds.length > 0 
      ? await prisma.eventCategory.findMany({
          where: { id: { in: categoryIds as string[] } },
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        })
      : [];

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // 6. Transform data to WordPressEventResponse format
    const transformedEvents = events.map((event) => {
      const registrationCount =
        event._count.registrations + event._count.customerRegistrations;
      const availableSlots = event.maxAttendees
        ? event.maxAttendees - registrationCount
        : null;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        price: event.price,
        isFree: event.isFree,
        imageUrl: event.imageUrl,
        maxAttendees: event.maxAttendees,
        isFeatured: false,
        memberDiscount: event.memberDiscount,
        memberDiscountType: event.memberDiscountType,
        category: event.categoryId ? categoryMap.get(event.categoryId) || null : null,
        freebies: [],
        registrationCount,
        availableSlots,
        registrationUrl: `${process.env.NEXTAUTH_URL}/events/${event.id}`,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: transformedEvents,
        meta: {
          count: transformedEvents.length,
          generatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
          "Access-Control-Allow-Origin":
            process.env.WORDPRESS_SITE_URL || "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "x-api-key",
        },
      }
    );
  } catch (error) {
    console.error("WordPress API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": process.env.WORDPRESS_SITE_URL || "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "x-api-key",
      },
    }
  );
}