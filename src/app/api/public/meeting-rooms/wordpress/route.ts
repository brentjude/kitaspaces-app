import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, MeetingRoomStatus } from "@/generated/prisma";
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
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const status = searchParams.get("status") || "";

    // 4. Build query
    const where: Prisma.MeetingRoomWhereInput = {};

    if (status) {
      const validStatuses = Object.values(MeetingRoomStatus);
      if (validStatuses.includes(status as MeetingRoomStatus)) {
        where.status = status as MeetingRoomStatus;
      }
    } else {
      // Default: only show available rooms
      where.status = MeetingRoomStatus.AVAILABLE;
    }

    // 5. Fetch meeting rooms (only public data)
    const rooms = await prisma.meetingRoom.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        capacity: true,
        hourlyRate: true,
        coverPhotoUrl: true,
        amenities: true,
        status: true,
        floor: true,
        roomNumber: true,
      },
      orderBy: { name: "asc" },
      take: limit,
    });

    // 6. Transform data to WordPressMeetingRoomResponse format
    const transformedRooms = rooms.map((room) => {
      // Parse amenities from JSON string to array
      let amenitiesArray: string[] | null = null;
      if (room.amenities) {
        try {
          amenitiesArray = JSON.parse(room.amenities);
        } catch (error) {
          console.error("Error parsing amenities:", error);
          amenitiesArray = null;
        }
      }

      // Combine floor and room number for location
      const location = [room.floor, room.roomNumber]
        .filter(Boolean)
        .join(", ") || null;

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        hourlyRate: room.hourlyRate,
        imageUrl: room.coverPhotoUrl,
        amenities: amenitiesArray,
        status: room.status,
        location,
        floorLevel: room.floor,
        bookingUrl: `${process.env.NEXTAUTH_URL}/meeting-rooms/${room.id}`,
      };
    });

    // 7. Add cache headers
    return NextResponse.json(
      {
        success: true,
        data: transformedRooms,
        meta: {
          count: transformedRooms.length,
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

// Handle preflight requests
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